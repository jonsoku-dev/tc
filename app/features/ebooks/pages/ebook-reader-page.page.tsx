import { useNavigate } from "react-router";
import { createClient } from "~/supa-client";
import { EbookPageViewer } from "../components/ebook-page-viewer";
import { EbookReaderProvider, useEbookReader, useEbookReaderHandlers } from "../machines/ebook-reader.context";
import { EbookUIProvider, useEbookUI } from "../machines/ebook-ui.context";
import type { Route } from "./+types/ebook-reader-page.page";
import type { Highlight, BookmarkItem, PageContentType } from "../components/types";
import { useSupabase } from "~/common/hooks/use-supabase";
import React from "react";

// 로더 함수
export async function loader({ params }: Route.LoaderArgs) {
    // Supabase 클라이언트 생성
    const supabase = createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    });

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
            .order('page_number', { ascending: true });

        if (pagesError) {
            console.error("전자책 페이지 조회 오류:", pagesError);
            throw new Response("전자책 페이지를 가져오는 중 오류가 발생했습니다.", { status: 500 });
        }

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
            highlights: highlights?.map(h => ({
                id: h.highlight_id,
                text: h.text || "",
                startOffset: h.start_position,
                endOffset: h.end_position,
                color: h.color || "#FFEB3B",
                note: h.note || undefined,
                createdAt: new Date(h.created_at || new Date()),
                pageNumber: h.page_number
            })) || [],
            bookmarks: bookmarks?.map(b => ({
                id: b.bookmark_id,
                position: 0,
                title: b.title || "북마크",
                createdAt: new Date(b.created_at || new Date()),
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

// 액션 함수 - 읽기 진행 상황, 북마크, 하이라이트 업데이트
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const actionType = formData.get("actionType") as string;

    // Supabase 클라이언트 생성
    const supabase = createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    });

    try {
        switch (actionType) {
            case "updateProgress": {
                const ebookId = formData.get("ebookId") as string;
                const userId = formData.get("userId") as string;
                const currentPage = parseInt(formData.get("currentPage") as string, 10);
                const progressPercentage = parseFloat(formData.get("progressPercentage") as string);
                const isCompleted = formData.get("isCompleted") === "true";

                if (!ebookId || !userId || isNaN(currentPage)) {
                    return { success: false, error: "필수 정보가 누락되었습니다." };
                }

                // 기존 진행 상황 확인
                const { data: existingProgress } = await supabase
                    .from('reading_progress')
                    .select('*')
                    .eq('ebook_id', ebookId)
                    .eq('user_id', userId)
                    .single();

                if (existingProgress) {
                    // 기존 진행 상황 업데이트
                    const { error } = await supabase
                        .from('reading_progress')
                        .update({
                            current_page: currentPage,
                            progress_percentage: progressPercentage,
                            is_completed: isCompleted,
                            last_read_at: new Date().toISOString()
                        })
                        .eq('progress_id', existingProgress.progress_id);

                    if (error) throw error;
                } else {
                    // 새 진행 상황 생성
                    const { error } = await supabase
                        .from('reading_progress')
                        .insert({
                            ebook_id: ebookId,
                            user_id: userId,
                            current_page: currentPage,
                            progress_percentage: progressPercentage,
                            is_completed: isCompleted,
                            last_read_at: new Date().toISOString()
                        });

                    if (error) throw error;
                }

                return { success: true };
            }

            case "addBookmark": {
                const ebookId = formData.get("ebookId") as string;
                const userId = formData.get("userId") as string;
                const pageNumber = parseInt(formData.get("pageNumber") as string, 10);
                const title = formData.get("title") as string;

                if (!ebookId || !userId || isNaN(pageNumber)) {
                    return { success: false, error: "필수 정보가 누락되었습니다." };
                }

                const { data, error } = await supabase
                    .from('bookmarks')
                    .insert({
                        ebook_id: ebookId,
                        user_id: userId,
                        page_number: pageNumber,
                        title: title || `${pageNumber}페이지 북마크`
                    })
                    .select();

                if (error) throw error;

                return {
                    success: true,
                    bookmark: {
                        id: data[0].bookmark_id,
                        position: 0,
                        title: data[0].title || "북마크",
                        createdAt: new Date(data[0].created_at || new Date()),
                        pageNumber: data[0].page_number
                    }
                };
            }

            case "deleteBookmark": {
                const bookmarkId = formData.get("bookmarkId") as string;

                if (!bookmarkId) {
                    return { success: false, error: "북마크 ID가 필요합니다." };
                }

                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('bookmark_id', bookmarkId);

                if (error) throw error;

                return { success: true };
            }

            case "addHighlight": {
                const ebookId = formData.get("ebookId") as string;
                const userId = formData.get("userId") as string;
                const pageNumber = parseInt(formData.get("pageNumber") as string, 10);
                const text = formData.get("text") as string;
                const startPosition = parseInt(formData.get("startPosition") as string, 10);
                const endPosition = parseInt(formData.get("endPosition") as string, 10);
                const color = formData.get("color") as string;
                const note = formData.get("note") as string;

                if (!ebookId || !userId || isNaN(pageNumber) || !text || isNaN(startPosition) || isNaN(endPosition)) {
                    return { success: false, error: "필수 정보가 누락되었습니다." };
                }

                const { data, error } = await supabase
                    .from('highlights')
                    .insert({
                        ebook_id: ebookId,
                        user_id: userId,
                        page_number: pageNumber,
                        text,
                        start_position: startPosition,
                        end_position: endPosition,
                        color: color || "#FFEB3B",
                        note
                    })
                    .select();

                if (error) throw error;

                return {
                    success: true,
                    highlight: {
                        id: data[0].highlight_id,
                        text: data[0].text || "",
                        startOffset: data[0].start_position,
                        endOffset: data[0].end_position,
                        color: data[0].color || "#FFEB3B",
                        note: data[0].note || undefined,
                        createdAt: new Date(data[0].created_at || new Date()),
                        pageNumber: data[0].page_number
                    }
                };
            }

            case "deleteHighlight": {
                const highlightId = formData.get("highlightId") as string;

                if (!highlightId) {
                    return { success: false, error: "하이라이트 ID가 필요합니다." };
                }

                const { error } = await supabase
                    .from('highlights')
                    .delete()
                    .eq('highlight_id', highlightId);

                if (error) throw error;

                return { success: true };
            }

            case "updateHighlightNote": {
                const highlightId = formData.get("highlightId") as string;
                const note = formData.get("note") as string;

                if (!highlightId) {
                    return { success: false, error: "하이라이트 ID가 필요합니다." };
                }

                const { error } = await supabase
                    .from('highlights')
                    .update({ note })
                    .eq('highlight_id', highlightId);

                if (error) throw error;

                return { success: true };
            }

            default:
                return { success: false, error: "지원하지 않는 액션 타입입니다." };
        }
    } catch (error) {
        console.error("액션 처리 오류:", error);
        return { success: false, error: "액션 처리 중 오류가 발생했습니다." };
    }
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: `${data.ebook.title} - 읽기` },
        { name: "description", content: data.ebook.description },
    ];
}

// 메인 컴포넌트 래퍼
export default function EbookReaderPage({ loaderData, actionData }: Route.ComponentProps) {
    const { ebook, highlights: initialHighlights, bookmarks: initialBookmarks, currentPage } = loaderData;
    const { supabase } = useSupabase();

    // 액션 데이터 처리
    React.useEffect(() => {
        if (actionData?.success) {
            console.log("액션 성공:", actionData);
        } else if (actionData?.error) {
            console.error("액션 오류:", actionData.error);
            // 여기에 오류 처리 로직 추가
        }
    }, [actionData]);

    return (
        <EbookReaderProvider
            initialPage={currentPage}
            initialHighlights={initialHighlights}
            initialBookmarks={initialBookmarks}
            maxPage={ebook.page_count}
        >
            <EbookUIProvider>
                <EbookReaderContent ebook={ebook} />
            </EbookUIProvider>
        </EbookReaderProvider>
    );
}

// 실제 컨텐츠 컴포넌트 - Context를 사용
function EbookReaderContent({ ebook }: { ebook: any }) {
    const navigate = useNavigate();
    const { currentPage, highlights, bookmarks, activeItemId } = useEbookReader();
    const handlers = useEbookReaderHandlers();
    const { supabase } = useSupabase();
    const [userId, setUserId] = React.useState<string | null>(null);
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
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUserId(data.user.id);
            }
        }
        getUserId();
    }, [supabase]);

    // 페이지 변경 시 진행 상황 업데이트
    React.useEffect(() => {
        if (userId && ebook.ebook_id) {
            const formData = new FormData();
            formData.append("actionType", "updateProgress");
            formData.append("ebookId", ebook.ebook_id);
            formData.append("userId", userId);
            formData.append("currentPage", currentPage.toString());
            formData.append("progressPercentage", ((currentPage / ebook.page_count) * 100).toString());
            formData.append("isCompleted", (currentPage >= ebook.page_count).toString());

            // 진행 상황 업데이트 요청
            fetch(window.location.pathname, {
                method: "POST",
                body: formData
            }).catch(error => {
                console.error("진행 상황 업데이트 오류:", error);
            });
        }
    }, [currentPage, ebook.ebook_id, ebook.page_count, userId]);

    // 북마크 추가 핸들러 오버라이드
    const handleAddBookmark = async (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => {
        if (!userId) {
            console.error("사용자 인증이 필요합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("actionType", "addBookmark");
        formData.append("ebookId", ebook.ebook_id);
        formData.append("userId", userId);
        formData.append("pageNumber", bookmark.pageNumber.toString());
        formData.append("title", bookmark.title);

        try {
            const response = await fetch(window.location.pathname, {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (result.success && result.bookmark) {
                handlers.handleAddBookmark({
                    title: result.bookmark.title,
                    pageNumber: result.bookmark.pageNumber,
                    position: result.bookmark.position
                });
            }
        } catch (error) {
            console.error("북마크 추가 오류:", error);
        }
    };

    // 북마크 삭제 핸들러 오버라이드
    const handleDeleteBookmark = async (id: string) => {
        const formData = new FormData();
        formData.append("actionType", "deleteBookmark");
        formData.append("bookmarkId", id);

        try {
            const response = await fetch(window.location.pathname, {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                handlers.handleDeleteBookmark(id);
            }
        } catch (error) {
            console.error("북마크 삭제 오류:", error);
        }
    };

    // 하이라이트 추가 핸들러 오버라이드
    const handleAddHighlight = async (highlight: Omit<Highlight, "id" | "createdAt">) => {
        if (!userId) {
            console.error("사용자 인증이 필요합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("actionType", "addHighlight");
        formData.append("ebookId", ebook.ebook_id);
        formData.append("userId", userId);
        formData.append("pageNumber", highlight.pageNumber.toString());
        formData.append("text", highlight.text);
        formData.append("startPosition", highlight.startOffset.toString());
        formData.append("endPosition", highlight.endOffset.toString());
        formData.append("color", highlight.color);
        formData.append("note", highlight.note || "");

        try {
            const response = await fetch(window.location.pathname, {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (result.success && result.highlight) {
                handlers.handleAddHighlight({
                    text: result.highlight.text,
                    startOffset: result.highlight.startOffset,
                    endOffset: result.highlight.endOffset,
                    color: result.highlight.color,
                    pageNumber: result.highlight.pageNumber,
                    note: result.highlight.note
                });
            }
        } catch (error) {
            console.error("하이라이트 추가 오류:", error);
        }
    };

    // 하이라이트 삭제 핸들러 오버라이드
    const handleDeleteHighlight = async (id: string) => {
        const formData = new FormData();
        formData.append("actionType", "deleteHighlight");
        formData.append("highlightId", id);

        try {
            const response = await fetch(window.location.pathname, {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                handlers.handleDeleteHighlight(id);
            }
        } catch (error) {
            console.error("하이라이트 삭제 오류:", error);
        }
    };

    // 하이라이트 노트 업데이트 핸들러 오버라이드
    const handleUpdateHighlightNote = async (id: string, note: string) => {
        const formData = new FormData();
        formData.append("actionType", "updateHighlightNote");
        formData.append("highlightId", id);
        formData.append("note", note);

        try {
            const response = await fetch(window.location.pathname, {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                handlers.handleUpdateHighlightNote(id, note);
            }
        } catch (error) {
            console.error("하이라이트 노트 업데이트 오류:", error);
        }
    };

    // 뒤로가기 핸들러
    const handleGoBack = () => {
        navigate(-1);
    };

    // 디버깅용 로그
    console.log("EbookReaderContent 렌더링:", { currentPage, highlights, bookmarks });

    return (
        <EbookPageViewer
            ebook={ebook}
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