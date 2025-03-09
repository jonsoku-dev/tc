import { useEffect } from "react";
import type { Ebook, EbookPage, Highlight, BookmarkItem } from "./types";
import { PageRenderer } from "./page-renderer";
import { PageNavigation } from "./page-navigation";
import { EbookReaderToolbar } from "./ebook-reader-toolbar";
import { EbookReaderSidebar } from "./ebook-reader-sidebar";
import { PageTransition } from "./page-transition";

interface EbookPageViewerProps {
    ebook: Ebook;
    tableOfContents: string[];
    currentPage: number;
    highlights: Highlight[];
    bookmarks: BookmarkItem[];
    onAddHighlight: (highlight: Omit<Highlight, "id" | "createdAt">) => void;
    onAddBookmark: (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => void;
    onDeleteHighlight: (highlightId: string) => void;
    onDeleteBookmark: (bookmarkId: string) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
    onPageChange: (pageNumber: number) => void;
    onNextPage: () => void;
    onPrevPage: () => void;
    onJumpToPage: (pageNumber: number) => void;
    onSetActiveItem: (itemId: string | null) => void;
    onGoBack?: () => void;
    className?: string;
    // UI 상태 (옵션)
    sidebarOpen?: boolean;
    fontSize?: number;
    lineHeight?: number;
    activeItemId?: string | null;
    // UI 이벤트 핸들러 (옵션)
    onToggleSidebar?: () => void;
    onIncreaseFontSize?: () => void;
    onDecreaseFontSize?: () => void;
    onIncreaseLineHeight?: () => void;
    onDecreaseLineHeight?: () => void;
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
    blockId?: string;
    blockType?: string;
};

export function EbookPageViewer({
    ebook,
    tableOfContents,
    currentPage,
    highlights = [],
    bookmarks = [],
    onAddHighlight,
    onAddBookmark,
    onDeleteHighlight,
    onDeleteBookmark,
    onUpdateHighlightNote,
    onPageChange,
    onNextPage,
    onPrevPage,
    onJumpToPage,
    onSetActiveItem,
    onGoBack,
    className = "",
    sidebarOpen = true,
    fontSize = 16,
    lineHeight = 1.6,
    activeItemId = null,
    onToggleSidebar = () => { },
    onIncreaseFontSize = () => { },
    onDecreaseFontSize = () => { },
    onIncreaseLineHeight = () => { },
    onDecreaseLineHeight = () => { },
}: EbookPageViewerProps) {
    // 현재 페이지 데이터
    const currentPageData = ebook.pages.find(page => page.page_number === currentPage) || ebook.pages[0];

    // 목차 아이템 생성
    const tocItems: SidebarTocItem[] = tableOfContents.map((title, index) => ({
        id: `toc-${index}`,
        title,
        level: 1,
        position: 0,
        pageNumber: index + 1, // 예시: 목차 항목과 페이지 번호 매핑
    }));

    // 텍스트 선택 처리
    const handleTextSelect = ({ text, startOffset, endOffset, pageNumber, blockId, blockType }: {
        text: string;
        startOffset: number;
        endOffset: number;
        pageNumber: number;
        blockId?: string | null;
        blockType?: string | null;
    }) => {
        if (!onAddHighlight) return;

        const newHighlight = {
            text,
            startOffset,
            endOffset,
            color: "#FFEB3B", // 기본 색상
            pageNumber,
            blockId: blockId || undefined,
            blockType: blockType || undefined,
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
        onJumpToPage(item.pageNumber);
        onSetActiveItem(item.id);
    };

    // 북마크 클릭 처리
    const handleBookmarkClick = (bookmark: SidebarBookmarkItem) => {
        onJumpToPage(bookmark.pageNumber);
    };

    // 하이라이트 클릭 처리
    const handleHighlightClick = (highlight: SidebarHighlight) => {
        onJumpToPage(highlight.pageNumber);
    };

    // 키보드 단축키 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 왼쪽 화살표: 이전 페이지
            if (e.key === 'ArrowLeft') {
                onPrevPage();
            }
            // 오른쪽 화살표: 다음 페이지
            else if (e.key === 'ArrowRight') {
                onNextPage();
            }
            // Home 키: 첫 페이지
            else if (e.key === 'Home') {
                onJumpToPage(1);
            }
            // End 키: 마지막 페이지
            else if (e.key === 'End') {
                onJumpToPage(ebook.page_count);
            }
            // 숫자 키: 페이지 점프 (Ctrl + 숫자)
            else if (e.ctrlKey && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 0 && parseInt(e.key) <= 9) {
                const pageNumber = parseInt(e.key) === 0 ? 10 : parseInt(e.key);
                // 전체 페이지의 10%, 20%, ... 90%, 100%로 이동
                const targetPage = Math.ceil((pageNumber / 10) * ebook.page_count);
                onJumpToPage(targetPage);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [ebook.page_count, onNextPage, onPrevPage, onJumpToPage]);

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
                onNextPage();
            }
            // 오른쪽으로 스와이프: 이전 페이지
            else if (diffX > 50) {
                onPrevPage();
            }
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onNextPage, onPrevPage]);

    return (
        <div className={`flex h-screen overflow-hidden bg-white ${className}`}>
            {/* 사이드바 */}
            {sidebarOpen && (
                <EbookReaderSidebar
                    title={ebook.title}
                    tocItems={tocItems}
                    bookmarks={bookmarks}
                    highlights={highlights}
                    currentPage={currentPage}
                    activeItemId={activeItemId}
                    onTocItemClick={handleTocItemClick}
                    onBookmarkClick={handleBookmarkClick}
                    onDeleteBookmark={onDeleteBookmark}
                    onHighlightClick={handleHighlightClick}
                    onDeleteHighlight={onDeleteHighlight}
                    onUpdateHighlightNote={onUpdateHighlightNote}
                />
            )}

            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* 상단 툴바 */}
                <div className="flex-shrink-0 sticky top-0 left-0 right-0 z-10">
                    <EbookReaderToolbar
                        title={ebook.title}
                        currentPage={currentPage}
                        totalPages={ebook.page_count}
                        fontSize={fontSize}
                        lineHeight={lineHeight}
                        onToggleSidebar={onToggleSidebar}
                        onAddBookmark={addBookmark}
                        onIncreaseFontSize={onIncreaseFontSize}
                        onDecreaseFontSize={onDecreaseFontSize}
                        onIncreaseLineHeight={onIncreaseLineHeight}
                        onDecreaseLineHeight={onDecreaseLineHeight}
                        onGoBack={onGoBack}
                    />
                </div>

                {/* 페이지 콘텐츠 */}
                <div className="flex-1 overflow-auto p-4">
                    <div
                        className="max-w-3xl w-full mx-auto bg-white shadow-lg rounded-lg p-8 min-h-[300px] overflow-auto"
                        style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                    >
                        <PageTransition
                            pages={ebook.pages}
                            currentPage={currentPage}
                            highlights={highlights}
                            onTextSelect={handleTextSelect}
                        />
                    </div>
                </div>

                {/* 하단 네비게이션 */}
                <div className="flex-shrink-0 w-full fixed bottom-0 left-0 right-0">
                    <PageNavigation
                        currentPage={currentPage}
                        totalPages={ebook.page_count}
                        onPrevPage={onPrevPage}
                        onNextPage={onNextPage}
                        onJumpToPage={onJumpToPage}
                        className="shadow-md"
                    />
                </div>
            </div>
        </div>
    );
} 