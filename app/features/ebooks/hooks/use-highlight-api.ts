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

// Supabase 하이라이트 행을 클라이언트 하이라이트 객체로 변환
function convertHighlightRowToHighlight(row: any): Highlight {
    return {
        id: row.highlight_id,
        text: row.text,
        startOffset: row.start_position,
        endOffset: row.end_position,
        color: row.color || "#FFEB3B",
        note: row.note || undefined,
        createdAt: new Date(row.created_at || new Date()),
        pageNumber: row.page_number,
        blockId: row.block_id || undefined,
        blockType: row.block_type || undefined
    };
}

/**
 * 하이라이트 목록을 조회하는 훅
 */
export function useHighlights(ebookId: string, pageNumber?: number) {
    const { supabase } = useSupabase();
    const { ref, inView } = useInView();
    const queryClient = useQueryClient();

    // 쿼리 키 결정
    const queryKey = pageNumber !== undefined
        ? EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, pageNumber)
        : EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey,
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

            if (error) {
                console.error("하이라이트 조회 오류:", error);
                throw error;
            }

            return {
                highlights: (data as any[]).map(convertHighlightRowToHighlight),
                nextPage: data.length === 10 ? pageParam + 10 : undefined,
                totalCount: count || 0
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0,
        staleTime: 1000 * 10, // 10초
        refetchInterval: 5000, // 5초마다 자동 갱신
    });

    // 무한 스크롤 처리
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 다른 탭에서 변경이 있을 때 자동 갱신
    useEffect(() => {
        const channel = supabase
            .channel('highlight-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'highlights',
                filter: `ebook_id=eq.${ebookId}`
            }, (payload) => {
                console.log('하이라이트 변경 감지:', payload);
                refetch();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, ebookId, refetch]);

    return {
        data,
        status,
        highlights: data?.pages.flatMap(page => page.highlights) || [],
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        ref,
        refetch
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

            if (error) {
                console.error("하이라이트 생성 오류:", error);
                throw error;
            }

            return convertHighlightRowToHighlight(data);
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

            // 캐시 업데이트
            updateHighlightCache(queryClient, ebookId, newHighlight, 'add');
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

            if (error) {
                console.error("하이라이트 노트 업데이트 오류:", error);
                throw error;
            }

            return convertHighlightRowToHighlight(data);
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

            // 업데이트할 하이라이트 찾기
            const highlightToUpdate = previousHighlights?.pages.flatMap(page => page.highlights).find(h => h.id === highlightId);

            if (highlightToUpdate) {
                // Optimistic 업데이트
                const updatedHighlight = { ...highlightToUpdate, note };
                updateHighlightCache(queryClient, ebookId, updatedHighlight, 'update');

                // 페이지별 하이라이트 데이터도 업데이트
                updateHighlightPageCache(queryClient, ebookId, updatedHighlight, 'update');
            }

            return { previousHighlights, pageNumber: highlightToUpdate?.pageNumber };
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
        onSettled: (data, error, { highlightId, note }, context) => {
            // 모든 하이라이트 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
            });

            // 특정 페이지 하이라이트 쿼리 무효화
            if (context?.pageNumber) {
                queryClient.invalidateQueries({
                    queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, context.pageNumber)
                });
            } else if (data) {
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
            try {
                console.log("API에서 삭제할 하이라이트 ID:", highlightId);

                // 삭제 전에 하이라이트 정보 가져오기
                const { data: highlightData, error: getError } = await supabase
                    .from("highlights")
                    .select("page_number, highlight_id")
                    .eq("highlight_id", highlightId)
                    .single();

                if (getError) {
                    console.error("하이라이트 정보 조회 오류:", getError);
                    throw getError;
                }

                if (!highlightData) {
                    throw new Error("하이라이트를 찾을 수 없습니다.");
                }

                const pageNumber = (highlightData as any).page_number;
                const id = (highlightData as any).highlight_id;

                // 하이라이트 삭제
                const { error } = await supabase
                    .from("highlights")
                    .delete()
                    .eq("highlight_id", highlightId);

                if (error) {
                    console.error("하이라이트 삭제 오류:", error);
                    throw error;
                }

                return { id, pageNumber };
            } catch (error) {
                console.error("하이라이트 삭제 중 오류 발생:", error);
                throw error;
            }
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

            // 삭제할 하이라이트 찾기
            const highlightToDelete = previousHighlights?.pages.flatMap(page => page.highlights).find(h => h.id === highlightId);

            if (highlightToDelete) {
                // Optimistic 업데이트
                updateHighlightCache(queryClient, ebookId, highlightToDelete, 'delete');

                // 페이지별 하이라이트 데이터도 업데이트
                updateHighlightPageCache(queryClient, ebookId, highlightToDelete, 'delete');
            }

            return { previousHighlights, pageNumber: highlightToDelete?.pageNumber };
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
            } else if (data?.pageNumber) {
                queryClient.invalidateQueries({
                    queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, data.pageNumber)
                });
            }
        },
    });
}

// 캐시 업데이트 헬퍼 함수
function updateHighlightCache(
    queryClient: any,
    ebookId: string,
    highlight: Highlight,
    action: 'add' | 'update' | 'delete'
) {
    const queryData = queryClient.getQueryData<{
        pages: { highlights: Highlight[] }[];
        pageParams: number[];
    }>(EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId));

    if (!queryData) return;

    let updatedPages;

    switch (action) {
        case 'add':
            // 첫 페이지에 새 하이라이트 추가
            updatedPages = queryData.pages.map((page, index) => {
                if (index === 0) {
                    return {
                        ...page,
                        highlights: [highlight, ...page.highlights]
                    };
                }
                return page;
            });
            break;

        case 'update':
            // 모든 페이지에서 하이라이트 업데이트
            updatedPages = queryData.pages.map(page => ({
                ...page,
                highlights: page.highlights.map(h =>
                    h.id === highlight.id ? highlight : h
                )
            }));
            break;

        case 'delete':
            // 모든 페이지에서 하이라이트 삭제
            updatedPages = queryData.pages.map(page => ({
                ...page,
                highlights: page.highlights.filter(h => h.id !== highlight.id)
            }));
            break;
    }

    queryClient.setQueryData(
        EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId),
        {
            ...queryData,
            pages: updatedPages
        }
    );
}

// 페이지별 캐시 업데이트 헬퍼 함수
function updateHighlightPageCache(
    queryClient: any,
    ebookId: string,
    highlight: Highlight,
    action: 'add' | 'update' | 'delete'
) {
    const pageNumber = highlight.pageNumber;
    const queryData = queryClient.getQueryData<{
        pages: { highlights: Highlight[] }[];
        pageParams: number[];
    }>(EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, pageNumber));

    if (!queryData) return;

    let updatedPages;

    switch (action) {
        case 'add':
            // 첫 페이지에 새 하이라이트 추가
            updatedPages = queryData.pages.map((page, index) => {
                if (index === 0) {
                    return {
                        ...page,
                        highlights: [highlight, ...page.highlights]
                    };
                }
                return page;
            });
            break;

        case 'update':
            // 모든 페이지에서 하이라이트 업데이트
            updatedPages = queryData.pages.map(page => ({
                ...page,
                highlights: page.highlights.map(h =>
                    h.id === highlight.id ? highlight : h
                )
            }));
            break;

        case 'delete':
            // 모든 페이지에서 하이라이트 삭제
            updatedPages = queryData.pages.map(page => ({
                ...page,
                highlights: page.highlights.filter(h => h.id !== highlight.id)
            }));
            break;
    }

    queryClient.setQueryData(
        EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, pageNumber),
        {
            ...queryData,
            pages: updatedPages
        }
    );
} 