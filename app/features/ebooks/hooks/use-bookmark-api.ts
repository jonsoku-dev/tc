import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { BookmarkItem } from "../components/types";
import { EBOOK_QUERY_KEYS } from "../constants/query-keys";
import { useSupabase } from "~/common/hooks/use-supabase";

// 북마크 데이터 타입 (Supabase 테이블 구조에 맞게 정의)
interface BookmarkRow {
    bookmark_id: string;
    ebook_id: string;
    user_id: string;
    title: string | null;
    page_number: number;
    position?: number;
    created_at: string | null;
    updated_at?: string | null;
}

/**
 * 북마크 목록을 조회하는 훅
 */
export function useBookmarks(ebookId: string) {
    const { supabase } = useSupabase();
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId),
        queryFn: async ({ pageParam = 0 }) => {
            const { data, error, count } = await supabase
                .from("bookmarks")
                .select("*", { count: "exact" })
                .eq("ebook_id", ebookId)
                .order("created_at", { ascending: false })
                .range(pageParam, pageParam + 9);

            if (error) throw error;

            return {
                bookmarks: (data as any[]).map(item => ({
                    id: item.bookmark_id,
                    position: item.position || 0,
                    title: item.title || `페이지 ${item.page_number}`,
                    createdAt: new Date(item.created_at || new Date()),
                    pageNumber: item.page_number
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
        bookmarks: data?.pages.flatMap(page => page.bookmarks) || [],
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        ref
    };
}

/**
 * 북마크를 생성하는 훅
 */
export function useCreateBookmark(ebookId: string) {
    const { supabase } = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => {
            // 현재 사용자 ID 가져오기
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("로그인이 필요합니다.");

            const { data, error } = await supabase
                .from("bookmarks")
                .insert({
                    ebook_id: ebookId,
                    user_id: user.id,
                    title: bookmark.title,
                    page_number: bookmark.pageNumber,
                    position: bookmark.position || 0
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: (data as any).bookmark_id,
                title: (data as any).title,
                pageNumber: (data as any).page_number,
                position: (data as any).position || 0,
                createdAt: new Date((data as any).created_at || new Date())
            };
        },
        onSuccess: () => {
            // 북마크 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId)
            });
        },
    });
}

/**
 * 북마크를 삭제하는 훅
 */
export function useDeleteBookmark(ebookId: string) {
    const { supabase } = useSupabase();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bookmarkId: string) => {
            const { error } = await supabase
                .from("bookmarks")
                .delete()
                .eq("bookmark_id", bookmarkId);

            if (error) throw error;
            return { id: bookmarkId };
        },
        onMutate: async (bookmarkId) => {
            // 쿼리 취소
            await queryClient.cancelQueries({
                queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId)
            });

            // 이전 데이터 스냅샷 저장
            const previousBookmarks = queryClient.getQueryData<{
                pages: { bookmarks: BookmarkItem[] }[];
                pageParams: number[];
            }>(EBOOK_QUERY_KEYS.BOOKMARKS(ebookId));

            // Optimistic 업데이트
            if (previousBookmarks) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.BOOKMARKS(ebookId),
                    {
                        ...previousBookmarks,
                        pages: previousBookmarks.pages.map(page => ({
                            ...page,
                            bookmarks: page.bookmarks.filter(b => b.id !== bookmarkId)
                        }))
                    }
                );
            }

            return { previousBookmarks };
        },
        onError: (err, bookmarkId, context) => {
            // 오류 발생 시 이전 데이터로 롤백
            if (context?.previousBookmarks) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.BOOKMARKS(ebookId),
                    context.previousBookmarks
                );
            }
        },
        onSettled: () => {
            // 북마크 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId)
            });
        },
    });
} 