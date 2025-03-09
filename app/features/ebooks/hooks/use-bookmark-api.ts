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
    created_at: string | null;
    updated_at?: string | null;
}

/**
 * 북마크 목록을 조회하는 훅
 */
export function useBookmarks(ebookId: string) {
    const { supabase } = useSupabase();
    const { ref, inView } = useInView();
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId),
        queryFn: async ({ pageParam = 0 }) => {
            try {
                console.log(`북마크 조회 중: ebookId=${ebookId}, pageParam=${pageParam}`);

                // 현재 사용자 ID 가져오기
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("로그인이 필요합니다.");

                const { data, error, count } = await supabase
                    .from("bookmarks")
                    .select("*", { count: "exact" })
                    .eq("ebook_id", ebookId)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .range(pageParam, pageParam + 9);

                if (error) {
                    console.error("북마크 조회 오류:", error);
                    throw error;
                }

                if (!data) {
                    console.warn("북마크 데이터가 없습니다.");
                    return {
                        bookmarks: [],
                        nextPage: undefined,
                        totalCount: 0
                    };
                }

                console.log(`북마크 조회 결과: ${data.length}개 항목, 총 ${count}개`);

                return {
                    bookmarks: (data as any[]).map(item => ({
                        id: item.bookmark_id,
                        position: 0, // 클라이언트 측에서만 사용하는 기본값
                        title: item.title || `페이지 ${item.page_number}`,
                        createdAt: new Date(item.created_at || new Date()),
                        pageNumber: item.page_number
                    })),
                    nextPage: data.length === 10 ? pageParam + 10 : undefined,
                    totalCount: count || 0
                };
            } catch (error) {
                console.error("북마크 조회 중 오류 발생:", error);
                throw error;
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0,
        staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
        gcTime: 1000 * 60 * 10, // 10분 동안 가비지 컬렉션 방지
    });

    // 무한 스크롤 처리
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            console.log("다음 북마크 페이지 로드 중...");
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 오류 발생 시 자동 재시도
    useEffect(() => {
        if (error) {
            console.error("북마크 조회 오류 발생, 5초 후 재시도:", error);
            const timer = setTimeout(() => {
                refetch();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, refetch]);

    return {
        data,
        status,
        error,
        bookmarks: data?.pages.flatMap(page => page.bookmarks) || [],
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        refetch,
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
                    page_number: bookmark.pageNumber
                })
                .select()
                .single();

            if (error) {
                console.error("북마크 생성 오류:", error);
                throw error;
            }

            if (!data) {
                throw new Error("북마크 생성 후 데이터를 받지 못했습니다.");
            }

            console.log("생성된 북마크:", data);

            return {
                id: (data as any).bookmark_id,
                title: (data as any).title || `페이지 ${(data as any).page_number}`,
                pageNumber: (data as any).page_number,
                position: 0,
                createdAt: new Date((data as any).created_at || new Date())
            };
        },
        onMutate: async (newBookmark) => {
            // 쿼리 취소
            await queryClient.cancelQueries({
                queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId)
            });

            // 이전 데이터 스냅샷 저장
            const previousBookmarks = queryClient.getQueryData<{
                pages: { bookmarks: BookmarkItem[] }[];
                pageParams: number[];
            }>(EBOOK_QUERY_KEYS.BOOKMARKS(ebookId));

            // 낙관적 업데이트를 위한 임시 북마크 생성
            const tempBookmark: BookmarkItem = {
                id: `temp-${Date.now()}`,
                title: newBookmark.title || `페이지 ${newBookmark.pageNumber}`,
                pageNumber: newBookmark.pageNumber,
                position: 0,
                createdAt: new Date()
            };

            // Optimistic 업데이트
            if (previousBookmarks) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.BOOKMARKS(ebookId),
                    {
                        ...previousBookmarks,
                        pages: previousBookmarks.pages.map((page, index) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    bookmarks: [tempBookmark, ...page.bookmarks]
                                };
                            }
                            return page;
                        })
                    }
                );
            }

            return { previousBookmarks };
        },
        onError: (err, newBookmark, context) => {
            console.error("북마크 생성 오류:", err);

            // 오류 발생 시 이전 데이터로 롤백
            if (context?.previousBookmarks) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.BOOKMARKS(ebookId),
                    context.previousBookmarks
                );
            }
        },
        onSuccess: (data) => {
            console.log("북마크 생성 성공:", data);

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
            try {
                console.log("삭제할 북마크 ID:", bookmarkId);

                // 북마크 정보 조회 (삭제 전에 정보 저장)
                const { data: bookmarkData, error: getError } = await supabase
                    .from("bookmarks")
                    .select("*")
                    .eq("bookmark_id", bookmarkId)
                    .single();

                if (getError) {
                    console.error("북마크 정보 조회 오류:", getError);
                    throw getError;
                }

                if (!bookmarkData) {
                    throw new Error("북마크를 찾을 수 없습니다.");
                }

                // 북마크 삭제
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .eq("bookmark_id", bookmarkId);

                if (error) {
                    console.error("북마크 삭제 오류:", error);
                    throw error;
                }

                console.log("북마크 삭제 성공:", bookmarkId);

                return {
                    id: bookmarkId,
                    pageNumber: (bookmarkData as any).page_number
                };
            } catch (error) {
                console.error("북마크 삭제 중 오류 발생:", error);
                throw error;
            }
        },
        onMutate: async (bookmarkId) => {
            console.log("북마크 낙관적 삭제 시작:", bookmarkId);

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
            console.error("북마크 삭제 오류:", err);

            // 오류 발생 시 이전 데이터로 롤백
            if (context?.previousBookmarks) {
                queryClient.setQueryData(
                    EBOOK_QUERY_KEYS.BOOKMARKS(ebookId),
                    context.previousBookmarks
                );
            }
        },
        onSettled: (data) => {
            console.log("북마크 삭제 완료:", data);

            // 북마크 쿼리 무효화
            queryClient.invalidateQueries({
                queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId)
            });
        },
    });
} 