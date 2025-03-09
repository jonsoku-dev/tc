import React from "react";
import { useNavigate } from "react-router";
import { useSupabase } from "~/common/hooks/use-supabase";
import { getServerClient } from "~/server";
import { createClient } from "~/supa-client";
import { EbookPageViewer } from "../components/ebook-page-viewer";
import type { BookmarkItem, Highlight } from "../components/types";
import { EbookReaderProvider, useEbookReader, useEbookReaderHandlers } from "../machines/ebook-reader.context";
import { EbookUIProvider, useEbookUI } from "../machines/ebook-ui.context";
import type { Route } from "./+types/ebook-reader-page.page";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// 로더 함수
export async function loader({ params, request }: Route.LoaderArgs) {
    const { supabase, headers } = getServerClient(request);

    const ebookId = params.ebookId;

    if (!ebookId) {
        throw new Response("전자책 ID가 필요합니다.", { status: 400 });
    }

    try {
        // 전자책 정보 가져오기
        const { data: ebook, error: ebookError } = await supabase
            .from('ebooks')
            .select('*')
            .eq('ebook_id', ebookId)
            .single();

        if (ebookError) {
            console.error("전자책 정보 조회 오류:", ebookError);
            throw new Response("전자책 정보를 가져오는 중 오류가 발생했습니다.", { status: 500 });
        }

        if (!ebook) {
            throw new Response("전자책을 찾을 수 없습니다.", { status: 404 });
        }

        // 전자책 페이지 가져오기
        const { data: pages, error: pagesError } = await supabase
            .from('ebook_pages')
            .select('*')
            .eq('ebook_id', ebookId)
            .order('position', { ascending: true });

        if (pagesError) {
            console.error("전자책 페이지 조회 오류:", pagesError);
            throw new Response("전자책 페이지를 가져오는 중 오류가 발생했습니다.", { status: 500 });
        }

        // 페이지 제목을 기반으로 목차 생성
        const tableOfContents = pages?.map(page => page.title || `${page.page_number}페이지`) || [];

        // 하이라이트 가져오기
        const { data: highlights, error: highlightsError } = await supabase
            .from('highlights')
            .select('*')
            .eq('ebook_id', ebookId);

        if (highlightsError) {
            console.error("하이라이트 조회 오류:", highlightsError);
            // 하이라이트 오류는 치명적이지 않으므로 빈 배열로 처리
        }

        // 북마크 가져오기
        const { data: bookmarks, error: bookmarksError } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('ebook_id', ebookId);

        if (bookmarksError) {
            console.error("북마크 조회 오류:", bookmarksError);
            // 북마크 오류는 치명적이지 않으므로 빈 배열로 처리
        }

        // 읽기 진행 상황 가져오기
        const { data: readingProgress, error: progressError } = await supabase
            .from('reading_progress')
            .select('*')
            .eq('ebook_id', ebookId)
            .single();

        if (progressError && progressError.code !== 'PGRST116') { // PGRST116: 결과가 없음
            console.error("읽기 진행 상황 조회 오류:", progressError);
            // 진행 상황 오류는 치명적이지 않으므로 무시
        }

        // 데이터 반환
        return {
            ebook: {
                ...ebook,
                pages: pages || [],
                page_count: pages?.length || 0
            },
            tableOfContents, // 생성된 목차 별도로 전달
            highlights: highlights?.map(h => ({
                id: h.highlight_id,
                text: h.text || "", // null 처리
                startOffset: h.start_position,
                endOffset: h.end_position,
                color: h.color || "#FFEB3B", // 기본 색상 제공
                note: h.note || undefined,
                createdAt: new Date(h.created_at || new Date()), // Date 객체로 변환
                pageNumber: h.page_number
            })) || [],
            bookmarks: bookmarks?.map(b => ({
                id: b.bookmark_id,
                position: 0, // 북마크 위치 정보가 없으면 0으로 설정
                title: b.title || "북마크", // 기본 제목 제공
                createdAt: new Date(b.created_at || new Date()), // Date 객체로 변환
                pageNumber: b.page_number
            })) || [],
            currentPage: readingProgress?.current_page || 1
        };
    } catch (error) {
        console.error("전자책 데이터 로딩 오류:", error);
        if (error instanceof Response) {
            throw error;
        }
        throw new Response("전자책 데이터를 가져오는 중 오류가 발생했습니다.", { status: 500 });
    }
}

export function meta({ data }: Route.MetaArgs) {
    // data가 없는 경우 기본값 제공
    if (!data || !data.ebook) {
        return [
            { title: "전자책 읽기" },
            { name: "description", content: "전자책을 읽어보세요." },
        ];
    }

    return [
        { title: `${data.ebook.title} - 읽기` },
        { name: "description", content: data.ebook.description || "전자책 설명이 없습니다." },
    ];
}

// 메인 컴포넌트 래퍼
export default function EbookReaderPage({ loaderData, actionData }: Route.ComponentProps) {
    // 로더 데이터가 없거나 ebook이 없는 경우 처리
    if (!loaderData || !loaderData.ebook) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg">전자책 정보를 불러오는 중 오류가 발생했습니다.</p>
            </div>
        );
    }

    const { ebook, tableOfContents, highlights: initialHighlights, bookmarks: initialBookmarks, currentPage } = loaderData;
    const { supabase } = useSupabase();

    return (
        <EbookReaderProvider
            initialPage={currentPage}
            initialHighlights={initialHighlights || []}
            initialBookmarks={initialBookmarks || []}
            maxPage={ebook.page_count || 0}
        >
            <EbookUIProvider>
                <EbookReaderContent ebook={ebook} tableOfContents={tableOfContents} />
            </EbookUIProvider>
        </EbookReaderProvider>
    );
}

// 실제 컨텐츠 컴포넌트 - Context를 사용
function EbookReaderContent({ ebook, tableOfContents }: { ebook: any, tableOfContents: string[] }) {
    const navigate = useNavigate();
    const { currentPage, highlights, bookmarks, activeItemId } = useEbookReader();
    const handlers = useEbookReaderHandlers();
    const { supabase } = useSupabase();
    const [userId, setUserId] = React.useState<string | null>(null);
    const queryClient = useQueryClient();
    const {
        sidebarOpen,
        fontSize,
        lineHeight,
        toggleSidebar,
        increaseFontSize,
        decreaseFontSize,
        increaseLineHeight,
        decreaseLineHeight
    } = useEbookUI();

    // 사용자 정보 가져오기
    React.useEffect(() => {
        async function getUserId() {
            try {
                const { data } = await supabase.auth.getUser();
                if (data?.user) {
                    setUserId(data.user.id);
                }
            } catch (error) {
                console.error("사용자 정보 가져오기 오류:", error);
            }
        }
        getUserId();
    }, [supabase]);

    // 페이지 변경 시 진행 상황 업데이트 mutation
    const updateProgressMutation = useMutation({
        mutationFn: async (data: {
            ebookId: string;
            userId: string;
            currentPage: number;
            progressPercentage: number;
            isCompleted: boolean;
        }) => {
            const { data: existingProgress } = await supabase
                .from('reading_progress')
                .select('*')
                .eq('ebook_id', data.ebookId)
                .eq('user_id', data.userId)
                .single();

            if (existingProgress) {
                // 기존 진행 상황 업데이트
                const { error } = await supabase
                    .from('reading_progress')
                    .update({
                        current_page: data.currentPage,
                        progress_percentage: data.progressPercentage,
                        is_completed: data.isCompleted,
                        last_read_at: new Date().toISOString()
                    })
                    .eq('progress_id', existingProgress.progress_id);

                if (error) throw error;
                return existingProgress.progress_id;
            } else {
                // 새 진행 상황 생성
                const { data: newProgress, error } = await supabase
                    .from('reading_progress')
                    .insert({
                        ebook_id: data.ebookId,
                        user_id: data.userId,
                        current_page: data.currentPage,
                        progress_percentage: data.progressPercentage,
                        is_completed: data.isCompleted,
                        last_read_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) throw error;
                return newProgress?.progress_id;
            }
        }
    });

    // 페이지 변경 시 진행 상황 업데이트
    React.useEffect(() => {
        if (userId && ebook && ebook.ebook_id) {
            updateProgressMutation.mutate({
                ebookId: ebook.ebook_id,
                userId,
                currentPage,
                progressPercentage: (currentPage / (ebook.page_count || 1)) * 100,
                isCompleted: currentPage >= (ebook.page_count || 0)
            });
        }
    }, [currentPage, ebook?.ebook_id, ebook?.page_count, userId]);

    // 북마크 추가 mutation
    const addBookmarkMutation = useMutation({
        mutationFn: async (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => {
            if (!userId || !ebook || !ebook.ebook_id) {
                throw new Error("사용자 인증이 필요하거나 전자책 정보가 없습니다.");
            }

            const { data, error } = await supabase
                .from('bookmarks')
                .insert({
                    ebook_id: ebook.ebook_id,
                    user_id: userId,
                    page_number: bookmark.pageNumber,
                    title: bookmark.title
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            // 북마크 추가 성공 시 context 업데이트
            if (data) {
                handlers.handleAddBookmark({
                    title: data.title || "",
                    pageNumber: data.page_number,
                    position: 0 // 기본값 설정
                });

                // 북마크 쿼리 무효화
                queryClient.invalidateQueries({ queryKey: ['bookmarks', ebook.ebook_id] });
            }
        },
        onError: (error) => {
            console.error("북마크 추가 오류:", error);
        }
    });

    // 북마크 삭제 mutation
    const deleteBookmarkMutation = useMutation({
        mutationFn: async (bookmarkId: string) => {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('bookmark_id', bookmarkId);

            if (error) throw error;
            return bookmarkId;
        },
        onSuccess: (bookmarkId) => {
            // 북마크 삭제 성공 시 context 업데이트
            handlers.handleDeleteBookmark(bookmarkId);

            // 북마크 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: ['bookmarks', ebook.ebook_id] });
        },
        onError: (error) => {
            console.error("북마크 삭제 오류:", error);
        }
    });

    // 하이라이트 추가 mutation
    const addHighlightMutation = useMutation({
        mutationFn: async (highlight: Omit<Highlight, "id" | "createdAt">) => {
            if (!userId || !ebook || !ebook.ebook_id) {
                throw new Error("사용자 인증이 필요하거나 전자책 정보가 없습니다.");
            }

            console.log("하이라이트 추가:", highlight);

            // Supabase에 하이라이트 추가
            const { data, error } = await supabase
                .from('highlights')
                .insert({
                    ebook_id: ebook.ebook_id,
                    user_id: userId,
                    page_number: highlight.pageNumber,
                    text: highlight.text,
                    start_position: highlight.startOffset,
                    end_position: highlight.endOffset,
                    color: highlight.color,
                    note: highlight.note || "",
                    block_id: highlight.blockId || null,
                    block_type: highlight.blockType || null
                })
                .select()
                .single();

            if (error) {
                console.error("하이라이트 추가 오류:", error);
                throw error;
            }

            if (!data) {
                throw new Error("하이라이트 추가 후 데이터를 받지 못했습니다.");
            }

            console.log("추가된 하이라이트:", data);
            return data;
        },
        onSuccess: (data) => {
            // 하이라이트 추가 성공 시 context 업데이트
            if (data) {
                const newHighlight: Highlight = {
                    id: data.highlight_id, // Supabase에서 생성된 UUID 사용
                    text: data.text || "",
                    startOffset: data.start_position,
                    endOffset: data.end_position,
                    color: data.color || "",
                    pageNumber: data.page_number,
                    note: data.note || undefined,
                    blockId: data.block_id || undefined,
                    blockType: data.block_type || undefined,
                    createdAt: data.created_at ? new Date(data.created_at) : new Date()
                };

                handlers.handleAddHighlight(newHighlight);

                // 하이라이트 쿼리 무효화
                queryClient.invalidateQueries({ queryKey: ['highlights', ebook.ebook_id] });

                // 하이라이트 변경 이벤트 발생 (사이드바와 동기화)
                window.dispatchEvent(new CustomEvent('highlight-change', {
                    detail: { type: 'add', highlight: newHighlight }
                }));
            }
        },
        onError: (error) => {
            console.error("하이라이트 추가 오류:", error);
        }
    });

    // 하이라이트 삭제 mutation
    const deleteHighlightMutation = useMutation({
        mutationFn: async (highlightId: string) => {
            try {
                console.log("Mutation에서 삭제할 하이라이트 ID:", highlightId);

                // 먼저 하이라이트 정보 조회
                const { data: highlightData, error: getError } = await supabase
                    .from("highlights")
                    .select("*")
                    .eq("highlight_id", highlightId)
                    .single();

                if (getError) {
                    console.error("하이라이트 정보 조회 오류:", getError);
                    throw getError;
                }

                if (!highlightData) {
                    throw new Error("하이라이트를 찾을 수 없습니다.");
                }

                // 하이라이트 삭제
                const { error } = await supabase
                    .from('highlights')
                    .delete()
                    .eq('highlight_id', highlightId);

                if (error) {
                    console.error("하이라이트 삭제 오류:", error);
                    throw error;
                }

                return highlightId;
            } catch (error) {
                console.error("하이라이트 삭제 중 오류 발생:", error);
                throw error;
            }
        },
        onSuccess: (highlightId) => {
            // 하이라이트 삭제 성공 시 context 업데이트
            handlers.handleDeleteHighlight(highlightId);

            // 하이라이트 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: ['highlights', ebook.ebook_id] });
        },
        onError: (error) => {
            console.error("하이라이트 삭제 오류:", error);
        }
    });

    // 하이라이트 노트 업데이트 mutation
    const updateHighlightNoteMutation = useMutation({
        mutationFn: async ({ highlightId, note }: { highlightId: string, note: string }) => {
            const { data, error } = await supabase
                .from('highlights')
                .update({ note })
                .eq('highlight_id', highlightId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            // 하이라이트 노트 업데이트 성공 시 context 업데이트
            if (data && data.highlight_id) {
                handlers.handleUpdateHighlightNote(data.highlight_id, data.note || "");

                // 하이라이트 쿼리 무효화
                queryClient.invalidateQueries({ queryKey: ['highlights', ebook.ebook_id] });
            }
        },
        onError: (error) => {
            console.error("하이라이트 노트 업데이트 오류:", error);
        }
    });

    // 핸들러 함수들
    const handleAddBookmark = (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => {
        addBookmarkMutation.mutate(bookmark);
    };

    const handleDeleteBookmark = (id: string) => {
        deleteBookmarkMutation.mutate(id);
    };

    const handleAddHighlight = (highlight: Omit<Highlight, "id" | "createdAt">) => {
        addHighlightMutation.mutate(highlight);
    };

    const handleDeleteHighlight = (id: string) => {
        console.log("EbookReaderPage에서 하이라이트 삭제 요청:", id);
        deleteHighlightMutation.mutate(id);
    };

    const handleUpdateHighlightNote = (id: string, note: string) => {
        updateHighlightNoteMutation.mutate({ highlightId: id, note });
    };

    // 뒤로가기 핸들러
    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <EbookPageViewer
            ebook={ebook}
            tableOfContents={tableOfContents}
            currentPage={currentPage}
            highlights={highlights}
            bookmarks={bookmarks}
            onAddHighlight={handleAddHighlight}
            onAddBookmark={handleAddBookmark}
            onDeleteHighlight={handleDeleteHighlight}
            onDeleteBookmark={handleDeleteBookmark}
            onUpdateHighlightNote={handleUpdateHighlightNote}
            onPageChange={handlers.handlePageChange}
            onNextPage={handlers.handleNextPage}
            onPrevPage={handlers.handlePrevPage}
            onJumpToPage={handlers.handleJumpToPage}
            onSetActiveItem={handlers.handleSetActiveItem}
            onGoBack={handleGoBack}
            sidebarOpen={sidebarOpen}
            fontSize={fontSize}
            lineHeight={lineHeight}
            activeItemId={activeItemId}
            onToggleSidebar={toggleSidebar}
            onIncreaseFontSize={increaseFontSize}
            onDecreaseFontSize={decreaseFontSize}
            onIncreaseLineHeight={increaseLineHeight}
            onDecreaseLineHeight={decreaseLineHeight}
        />
    );
} 