import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { EbookReaderSidebar } from "./ebook-reader-sidebar";
import { PageRenderer } from "./page-renderer";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateHighlight, useHighlights } from "../hooks/use-highlight-api";
import { EBOOK_QUERY_KEYS } from "../constants/query-keys";
import type { Highlight, EbookPage, TocItem, BookmarkItem } from "./types";
import type { Route } from "../+types";

interface EbookReaderProps {
    ebookId: string;
    initialPage: number;
    pages: EbookPage[];
    tocItems: TocItem[];
    loaderData?: any;
}

export function EbookReader({
    ebookId,
    initialPage,
    pages,
    tocItems,
    loaderData,
}: EbookReaderProps) {
    const navigate = useNavigate();
    const params = useParams();
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Tanstack Query를 사용하여 하이라이트 데이터 가져오기
    const { highlights: currentPageHighlights } = useHighlights(ebookId, currentPage);
    const createHighlightMutation = useCreateHighlight(ebookId);

    // 페이지 변경 핸들러
    const handlePageChange = useCallback((pageNumber: number) => {
        setCurrentPage(pageNumber);

        // URL 업데이트
        navigate(`/ebooks/${ebookId}/read?page=${pageNumber}`, { replace: true });

        // 현재 페이지에 해당하는 목차 아이템 찾기
        const tocItem = tocItems.find(item => item.pageNumber === pageNumber);
        if (tocItem) {
            setActiveItemId(tocItem.id);
        } else {
            setActiveItemId(null);
        }
    }, [navigate, ebookId, tocItems]);

    // 목차 아이템 클릭 핸들러
    const handleTocItemClick = useCallback((item: TocItem) => {
        handlePageChange(item.pageNumber);
        setActiveItemId(item.id);
    }, [handlePageChange]);

    // 북마크 클릭 핸들러
    const handleBookmarkClick = useCallback((bookmark: BookmarkItem) => {
        handlePageChange(bookmark.pageNumber);
    }, [handlePageChange]);

    // 하이라이트 클릭 핸들러
    const handleHighlightClick = useCallback((highlight: Highlight) => {
        handlePageChange(highlight.pageNumber);
    }, [handlePageChange]);

    // 하이라이트 노트 업데이트 핸들러
    const handleUpdateHighlightNote = useCallback((highlightId: string, note: string) => {
        // 하이라이트 노트 업데이트는 highlight-tab.tsx에서 처리
    }, []);

    // 텍스트 선택 핸들러 (하이라이트 추가)
    const handleTextSelect = useCallback((selection: {
        text: string;
        startOffset: number;
        endOffset: number;
        pageNumber: number;
        blockId: string | null;
        blockType: string | null;
        color?: string;
    }) => {
        // 하이라이트 생성
        createHighlightMutation.mutate({
            text: selection.text,
            startOffset: selection.startOffset,
            endOffset: selection.endOffset,
            pageNumber: selection.pageNumber,
            blockId: selection.blockId || undefined,
            blockType: selection.blockType || undefined,
            color: selection.color || "#FFEB3B",
        });
    }, [createHighlightMutation]);

    // 현재 페이지 컴포넌트
    const currentPageComponent = pages.find(p => p.page_number === currentPage);

    // 이전 페이지로 이동
    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    }, [currentPage, handlePageChange]);

    // 다음 페이지로 이동
    const goToNextPage = useCallback(() => {
        if (currentPage < pages.length) {
            handlePageChange(currentPage + 1);
        }
    }, [currentPage, pages.length, handlePageChange]);

    // 키보드 단축키 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                goToPreviousPage();
            } else if (e.key === "ArrowRight") {
                goToNextPage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [goToPreviousPage, goToNextPage]);

    // URL 쿼리 파라미터에서 페이지 번호 가져오기
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        if (pageParam) {
            const pageNumber = parseInt(pageParam, 10);
            if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= pages.length && pageNumber !== currentPage) {
                setCurrentPage(pageNumber);
            }
        }
    }, [pages.length, currentPage]);

    return (
        <div className="flex h-full">
            <EbookReaderSidebar
                title={pages[0]?.title || "이북 리더"}
                ebookId={ebookId}
                tocItems={tocItems}
                currentPage={currentPage}
                activeItemId={activeItemId}
                onTocItemClick={handleTocItemClick}
                onBookmarkClick={handleBookmarkClick}
                onHighlightClick={handleHighlightClick}
                onUpdateHighlightNote={handleUpdateHighlightNote}
                className="w-80 border-r"
            />
            <div className="flex-1 overflow-auto p-8 flex flex-col items-center">
                <div className="max-w-3xl w-full">
                    {currentPageComponent ? (
                        <>
                            <div className="mb-4 flex justify-between items-center">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage <= 1}
                                    className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
                                >
                                    이전
                                </button>
                                <div className="text-sm">
                                    {currentPage} / {pages.length}
                                </div>
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage >= pages.length}
                                    className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
                                >
                                    다음
                                </button>
                            </div>
                            <PageRenderer
                                page={currentPageComponent}
                                highlights={currentPageHighlights}
                                onTextSelect={handleTextSelect}
                                className="bg-white shadow-md rounded-lg p-8"
                            />
                        </>
                    ) : (
                        <div className="text-center py-8">
                            페이지를 찾을 수 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 로더 함수 - 서버 사이드에서 데이터를 가져옵니다
export async function loader({ params, request }: Route.LoaderArgs) {
    const { ebookId } = params;
    const url = new URL(request.url);
    const pageNumber = parseInt(url.searchParams.get('page') || '1', 10);

    // 여기서 서버 사이드 데이터를 가져옵니다
    // 예: const ebook = await getEbookById(ebookId);

    return {
        ebookId,
        pageNumber,
        // 기타 필요한 데이터
    };
}

// 메타 함수 - 페이지 메타데이터를 설정합니다
export function meta({ params, data }: Route.MetaArgs) {
    return [
        { title: `${data?.title || '이북'} 읽기` },
        { name: 'description', content: '이북 리더 페이지입니다.' }
    ];
} 