import { useState, useEffect } from "react";
import type { Ebook, EbookPage, Highlight, BookmarkItem } from "./types";
import { PageRenderer } from "./page-renderer";
import { PageNavigation } from "./page-navigation";
import { EbookReaderToolbar } from "./ebook-reader-toolbar";
import { EbookReaderSidebar } from "./ebook-reader-sidebar";
import { PageTransition } from "./page-transition";

interface EbookPageViewerProps {
    ebook: Ebook;
    initialPage?: number;
    highlights?: Highlight[];
    bookmarks?: BookmarkItem[];
    onAddHighlight?: (highlight: Omit<Highlight, "id" | "createdAt">) => void;
    onAddBookmark?: (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => void;
    onDeleteHighlight?: (highlightId: string) => void;
    onDeleteBookmark?: (bookmarkId: string) => void;
    onUpdateHighlightNote?: (highlightId: string, note: string) => void;
    onPageChange?: (pageNumber: number) => void;
    className?: string;
}

// 사이드바 컴포넌트에 전달할 props 타입 정의
type SidebarTocItem = {
    id: string;
    title: string;
    level: number;
    position: number;
    pageNumber: number;
};

type SidebarBookmarkItem = {
    id: string;
    position: number;
    title: string;
    createdAt: Date;
    pageNumber: number;
};

type SidebarHighlight = {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    color: string;
    note?: string;
    createdAt: Date;
    pageNumber: number;
};

export function EbookPageViewer({
    ebook,
    initialPage = 1,
    highlights = [],
    bookmarks = [],
    onAddHighlight,
    onAddBookmark,
    onDeleteHighlight,
    onDeleteBookmark,
    onUpdateHighlightNote,
    onPageChange,
    className = "",
}: EbookPageViewerProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [fontSize, setFontSize] = useState(16);
    const [lineHeight, setLineHeight] = useState(1.6);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    // 현재 페이지 데이터
    const currentPageData = ebook.pages.find(page => page.page_number === currentPage) || ebook.pages[0];

    // 목차 아이템 생성
    const tocItems: SidebarTocItem[] = ebook.table_of_contents.map((title, index) => ({
        id: `toc-${index}`,
        title,
        level: 1,
        position: 0,
        pageNumber: index + 1, // 예시: 목차 항목과 페이지 번호 매핑
    }));

    // 페이지 변경 시 콜백 호출
    useEffect(() => {
        if (onPageChange) {
            onPageChange(currentPage);
        }
    }, [currentPage, onPageChange]);

    // 텍스트 선택 처리
    const handleTextSelect = ({ text, startOffset, endOffset, pageNumber }: {
        text: string;
        startOffset: number;
        endOffset: number;
        pageNumber: number;
    }) => {
        if (!onAddHighlight) return;

        const newHighlight = {
            text,
            startOffset,
            endOffset,
            color: "#FFEB3B", // 기본 색상
            pageNumber,
        };

        onAddHighlight(newHighlight);
    };

    // 북마크 추가
    const addBookmark = () => {
        if (!onAddBookmark) return;

        const newBookmark = {
            position: 0, // 페이지 기반에서는 의미 없음
            title: currentPageData.title || `페이지 ${currentPage}`,
            pageNumber: currentPage,
        };

        onAddBookmark(newBookmark);
    };

    // 목차 아이템 클릭 처리
    const handleTocItemClick = (item: SidebarTocItem) => {
        setCurrentPage(item.pageNumber);
        setActiveItemId(item.id);
    };

    // 북마크 클릭 처리
    const handleBookmarkClick = (bookmark: SidebarBookmarkItem) => {
        setCurrentPage(bookmark.pageNumber);
    };

    // 하이라이트 클릭 처리
    const handleHighlightClick = (highlight: SidebarHighlight) => {
        setCurrentPage(highlight.pageNumber);
    };

    // 페이지 이동
    const goToNextPage = () => {
        if (currentPage < ebook.page_count) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // 특정 페이지로 점프
    const jumpToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= ebook.page_count) {
            setCurrentPage(pageNumber);
        }
    };

    // 키보드 단축키 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 왼쪽 화살표: 이전 페이지
            if (e.key === 'ArrowLeft') {
                goToPrevPage();
            }
            // 오른쪽 화살표: 다음 페이지
            else if (e.key === 'ArrowRight') {
                goToNextPage();
            }
            // Home 키: 첫 페이지
            else if (e.key === 'Home') {
                jumpToPage(1);
            }
            // End 키: 마지막 페이지
            else if (e.key === 'End') {
                jumpToPage(ebook.page_count);
            }
            // 숫자 키: 페이지 점프 (Ctrl + 숫자)
            else if (e.ctrlKey && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 0 && parseInt(e.key) <= 9) {
                const pageNumber = parseInt(e.key) === 0 ? 10 : parseInt(e.key);
                // 전체 페이지의 10%, 20%, ... 90%, 100%로 이동
                const targetPage = Math.ceil((pageNumber / 10) * ebook.page_count);
                jumpToPage(targetPage);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPage, ebook.page_count]);

    // 제스처 처리 (스와이프)
    useEffect(() => {
        let touchStartX = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diffX = touchEndX - touchStartX;

            // 왼쪽으로 스와이프: 다음 페이지
            if (diffX < -50) {
                goToNextPage();
            }
            // 오른쪽으로 스와이프: 이전 페이지
            else if (diffX > 50) {
                goToPrevPage();
            }
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [currentPage, ebook.page_count]);

    // 북마크 삭제 처리 함수
    const handleDeleteBookmark = (bookmarkId: string) => {
        if (onDeleteBookmark) {
            onDeleteBookmark(bookmarkId);
        }
    };

    // 하이라이트 삭제 처리 함수
    const handleDeleteHighlight = (highlightId: string) => {
        if (onDeleteHighlight) {
            onDeleteHighlight(highlightId);
        }
    };

    // 하이라이트 노트 업데이트 처리 함수
    const handleUpdateHighlightNote = (highlightId: string, note: string) => {
        if (onUpdateHighlightNote) {
            onUpdateHighlightNote(highlightId, note);
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden bg-white ${className}`}>
            {/* 사이드바 */}
            {sidebarOpen && (
                <EbookReaderSidebar
                    title={ebook.title}
                    tocItems={tocItems}
                    bookmarks={bookmarks}
                    highlights={highlights}
                    activeItemId={activeItemId}
                    onClose={() => setSidebarOpen(false)}
                    onTocItemClick={handleTocItemClick}
                    onBookmarkClick={handleBookmarkClick}
                    onBookmarkDelete={handleDeleteBookmark}
                    onHighlightClick={handleHighlightClick}
                    onHighlightDelete={handleDeleteHighlight}
                    onHighlightNoteUpdate={handleUpdateHighlightNote}
                    className="sticky top-0 h-screen overflow-y-auto"
                />
            )}

            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* 상단 툴바 */}
                <EbookReaderToolbar
                    title={ebook.title}
                    currentPage={currentPage}
                    totalPages={ebook.page_count}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    sidebarOpen={sidebarOpen}
                    onBackClick={() => window.history.back()}
                    onToggleSidebar={() => setSidebarOpen(true)}
                    onAddBookmark={addBookmark}
                    onFontSizeChange={setFontSize}
                    onLineHeightChange={setLineHeight}
                    className="sticky top-0 z-10 bg-white"
                />

                {/* 페이지 콘텐츠 */}
                <div
                    className="flex-1 flex items-center justify-center p-8 overflow-hidden"
                    style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                >
                    <div className="max-w-3xl w-full mx-auto bg-white shadow-lg rounded-lg p-8 h-[calc(100vh-200px)] overflow-hidden">
                        <PageTransition
                            pages={ebook.pages}
                            currentPage={currentPage}
                            highlights={highlights}
                            onTextSelect={handleTextSelect}
                        />
                    </div>
                </div>

                {/* 하단 네비게이션 */}
                <PageNavigation
                    currentPage={currentPage}
                    totalPages={ebook.page_count}
                    onPrevPage={goToPrevPage}
                    onNextPage={goToNextPage}
                    onJumpToPage={jumpToPage}
                    className="sticky bottom-0 z-10 bg-white"
                />
            </div>
        </div>
    );
} 