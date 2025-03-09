import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { Highlight } from "../components/types";
import { EBOOK_QUERY_KEYS } from "../constants/query-keys";
import { useSupabase } from "~/common/hooks/use-supabase";

// 하이라이트 데이터 타입 (Supabase 테이블 구조에 맞게 정의)
interface HighlightRow {
    highlight_id: string;
    ebook_id: string;
    user_id: string;
    text: string;
    start_position: number;
    end_position: number;
    color: string | null;
    note: string | null;
    page_number: number;
    block_id: string | null;
    block_type: string | null;
    created_at: string;
}

/**
 * 하이라이트 목록을 조회하는 훅
 */
export function useHighlights(ebookId: string, pageNumber?: number) {
    const { supabase } = useSupabase();
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: pageNumber
            ? EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, pageNumber)
            : EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId),
        queryFn: async ({ pageParam = 0 }) => {
            let query = supabase
                .from("highlights")
                .select("*", { count: "exact" })
                .eq("ebook_id", ebookId)
                .order("created_at", { ascending: false });

            // 페이지 번호가 지정된 경우 해당 페이지의 하이라이트만 조회
            if (pageNumber !== undefined) {
                query = query.eq("page_number", pageNumber);
            }

            const { data, error, count } = await query.range(pageParam, pageParam + 9);

            if (error) throw error;

            return {
                highlights: (data as HighlightRow[]).map(item => ({
                    id: item.highlight_id,
                    text: item.text,
                    startOffset: item.start_position,
                    endOffset: item.end_position,
                    color: item.color || "#FFEB3B",
                    note: item.note || undefined,
                    createdAt: new Date(item.created_at || new Date()),
                    pageNumber: item.page_number,
                    blockId: item.block_id || undefined,
                    blockType: item.block_type || undefined
                })),
                nextPage: data.length === 10 ? pageParam + 10 : undefined,
                totalCount: count || 0
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0
    });

    // 무한 스크롤 처리
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return {
        data,
        status,
        highlights: data?.pages.flatMap(page => page.highlights) || [],
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        ref
    };
}

/**
 * 하이라이트를 생성하는 훅
 */
export function useCreateHighlight(ebookId: string) {
    const { supabase } = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (highlight: Omit<Highlight, "id" | "createdAt">) => {
            // 현재 사용자 ID 가져오기
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("로그인이 필요합니다.");

            const { data, error } = await supabase
                .from("highlights")
                .insert({
                    ebook_id: ebookId,
                    user_id: user.id,
                    text: highlight.text,
                    start_position: highlight.startOffset,
                    end_position: highlight.endOffset,
                    color: highlight.color,
                    note: highlight.note,
                    page_number: highlight.pageNumber,
                    block_id: highlight.blockId,
                    block_type: highlight.blockType
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: (data as HighlightRow).highlight_id,
                text: (data as HighlightRow).text,
                startOffset: (data as HighlightRow).start_position,
                endOffset: (data as HighlightRow).end_position,
                color: (data as HighlightRow).color || "#FFEB3B",
                note: (data as HighlightRow).note || undefined,
                createdAt: new Date((data as HighlightRow).created_at || new Date()),
                pageNumber: (data as HighlightRow).page_number,
                blockId: (data as HighlightRow).block_id || undefined,
                blockType: (data as HighlightRow).block_type || undefined
            };
        },
        onSuccess: (newHighlight) => {
            // 모든 하이라이트 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
            });

            // 특정 페이지 하이라이트 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, newHighlight.pageNumber)
            });
        },
    });
}

/**
 * 하이라이트 노트를 업데이트하는 훅
 */
export function useUpdateHighlightNote(ebookId: string) {
    const { supabase } = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ highlightId, note }: { highlightId: string; note: string }) => {
            const { data, error } = await supabase
                .from("highlights")
                .update({ note })
                .eq("highlight_id", highlightId)
                .select()
                .single();

            if (error) throw error;

            return {
                id: (data as HighlightRow).highlight_id,
                text: (data as HighlightRow).text,
                startOffset: (data as HighlightRow).start_position,
                endOffset: (data as HighlightRow).end_position,
                color: (data as HighlightRow).color || "#FFEB3B",
                note: (data as HighlightRow).note || undefined,
                createdAt: new Date((data as HighlightRow).created_at || new Date()),
                pageNumber: (data as HighlightRow).page_number,
                blockId: (data as HighlightRow).block_id || undefined,
                blockType: (data as HighlightRow).block_type || undefined
            };
        },
        onMutate: async ({ highlightId, note }) => {
            // 쿼리 취소
            await queryClient.cancelQueries({
                queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
            });

            // 이전 데이터 스냅샷 저장
            const previousHighlights = queryClient.getQueryData<{
                pages: { highlights: Highlight[] }[];
                pageParams: number[];
            }>(EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId));

            // Optimistic 업데이트
            if (previousHighlights) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId),
                    {
                        ...previousHighlights,
                        pages: previousHighlights.pages.map(page => ({
                            ...page,
                            highlights: page.highlights.map(h =>
                                h.id === highlightId ? { ...h, note } : h
                            )
                        }))
                    }
                );
            }

            // 페이지별 하이라이트 데이터도 업데이트
            const updatedHighlight = previousHighlights?.pages.flatMap(page => page.highlights).find(h => h.id === highlightId);
            if (updatedHighlight) {
                const previousPageHighlights = queryClient.getQueryData<{
                    pages: { highlights: Highlight[] }[];
                    pageParams: number[];
                }>(EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, updatedHighlight.pageNumber));

                if (previousPageHighlights) {
                    queryClient.setQueryData(
                        EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, updatedHighlight.pageNumber),
                        {
                            ...previousPageHighlights,
                            pages: previousPageHighlights.pages.map(page => ({
                                ...page,
                                highlights: page.highlights.map(h =>
                                    h.id === highlightId ? { ...h, note } : h
                                )
                            }))
                        }
                    );
                }
            }

            return { previousHighlights };
        },
        onError: (err, { highlightId, note }, context) => {
            // 오류 발생 시 이전 데이터로 롤백
            if (context?.previousHighlights) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId),
                    context.previousHighlights
                );
            }
        },
        onSettled: (data) => {
            // 모든 하이라이트 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
            });

            if (data) {
                // 특정 페이지 하이라이트 쿼리 무효화
                queryClient.invalidateQueries({
                    queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, data.pageNumber)
                });
            }
        },
    });
}

/**
 * 하이라이트를 삭제하는 훅
 */
export function useDeleteHighlight(ebookId: string) {
    const { supabase } = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (highlightId: string) => {
            const { error } = await supabase
                .from("highlights")
                .delete()
                .eq("highlight_id", highlightId);

            if (error) throw error;
            return { id: highlightId };
        },
        onMutate: async (highlightId) => {
            // 쿼리 취소
            await queryClient.cancelQueries({
                queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
            });

            // 이전 데이터 스냅샷 저장
            const previousHighlights = queryClient.getQueryData<{
                pages: { highlights: Highlight[] }[];
                pageParams: number[];
            }>(EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId));

            // 삭제할 하이라이트의 페이지 번호 저장
            const highlightToDelete = previousHighlights?.pages.flatMap(page => page.highlights).find(h => h.id === highlightId);
            const pageNumber = highlightToDelete?.pageNumber;

            // Optimistic 업데이트
            if (previousHighlights) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId),
                    {
                        ...previousHighlights,
                        pages: previousHighlights.pages.map(page => ({
                            ...page,
                            highlights: page.highlights.filter(h => h.id !== highlightId)
                        }))
                    }
                );
            }

            // 페이지별 하이라이트 데이터도 업데이트
            if (pageNumber) {
                const previousPageHighlights = queryClient.getQueryData<{
                    pages: { highlights: Highlight[] }[];
                    pageParams: number[];
                }>(EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, pageNumber));

                if (previousPageHighlights) {
                    queryClient.setQueryData(
                        EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, pageNumber),
                        {
                            ...previousPageHighlights,
                            pages: previousPageHighlights.pages.map(page => ({
                                ...page,
                                highlights: page.highlights.filter(h => h.id !== highlightId)
                            }))
                        }
                    );
                }
            }

            return { previousHighlights, pageNumber };
        },
        onError: (err, highlightId, context) => {
            // 오류 발생 시 이전 데이터로 롤백
            if (context?.previousHighlights) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId),
                    context.previousHighlights
                );
            }
        },
        onSettled: (data, error, highlightId, context) => {
            // 모든 하이라이트 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
            });

            // 특정 페이지 하이라이트 쿼리 무효화
            if (context?.pageNumber) {
                queryClient.invalidateQueries({
                    queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, context.pageNumber)
                });
            }
        },
    });
} 