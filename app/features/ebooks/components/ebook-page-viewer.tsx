import { useEffect, useRef, useState } from "react";
import { EbookReaderSidebar } from "./ebook-reader-sidebar";
import { EbookReaderToolbar } from "./ebook-reader-toolbar";
import { PageNavigation } from "./page-navigation";
import { PageTransition } from "./page-transition";
import type { BookmarkItem, Ebook, Highlight } from "./types";
import { useBookmarks } from "../hooks/use-bookmark-api";
import { useQueryClient } from "@tanstack/react-query";
import { EBOOK_QUERY_KEYS } from "../constants/query-keys";
import { useMediaQuery } from "../hooks/use-media-query";

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
    fontFamily?: string;
    theme?: 'light' | 'dark' | 'sepia';
    searchQuery?: string;
    searchResults?: Array<{
        pageNumber: number;
        text: string;
        startOffset: number;
        endOffset: number;
        blockId?: string;
        blockType?: string;
    }>;
    currentSearchIndex?: number;
    hasActiveSearch?: boolean;
    activeItemId?: string | null;
    // UI 이벤트 핸들러 (옵션)
    onToggleSidebar?: () => void;
    onIncreaseFontSize?: () => void;
    onDecreaseFontSize?: () => void;
    onIncreaseLineHeight?: () => void;
    onDecreaseLineHeight?: () => void;
    onSetFontFamily?: (fontFamily: string) => void;
    onSetTheme?: (theme: 'light' | 'dark' | 'sepia') => void;
    onSearch?: (query: string) => void;
    onNextSearchResult?: () => void;
    onPrevSearchResult?: () => void;
    onClearSearch?: () => void;
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
    fontFamily = "Noto Sans KR, sans-serif",
    theme = "light",
    searchQuery = "",
    searchResults = [],
    currentSearchIndex = 0,
    hasActiveSearch = false,
    activeItemId = null,
    onToggleSidebar = () => { },
    onIncreaseFontSize = () => { },
    onDecreaseFontSize = () => { },
    onIncreaseLineHeight = () => { },
    onDecreaseLineHeight = () => { },
    onSetFontFamily = () => { },
    onSetTheme = () => { },
    onSearch = () => { },
    onNextSearchResult = () => { },
    onPrevSearchResult = () => { },
    onClearSearch = () => { },
}: EbookPageViewerProps) {
    // 쿼리 클라이언트
    const queryClient = useQueryClient();

    // 모바일 환경 감지
    const isMobile = useMediaQuery("(max-width: 768px)");

    // 사이드바 참조
    const sidebarRef = useRef<HTMLDivElement>(null);

    // 사이드바 외부 클릭 감지
    useEffect(() => {
        if (!isMobile) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onToggleSidebar();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobile, sidebarOpen, onToggleSidebar]);

    // 북마크 데이터 가져오기 (실시간 동기화를 위해 직접 훅 사용)
    const { bookmarks: realtimeBookmarks } = useBookmarks(ebook.ebook_id);

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
    const handleTextSelect = ({ text, startOffset, endOffset, pageNumber, blockId, blockType, color }: {
        text: string;
        startOffset: number;
        endOffset: number;
        pageNumber: number;
        blockId?: string | null;
        blockType?: string | null;
        color?: string;
    }) => {
        if (!onAddHighlight || !text.trim()) return;

        // TextSelectionMenu에서 전달받은 하이라이트 정보를 그대로 onAddHighlight에 전달
        // 이 함수는 TextSelectionMenu에서 색상 선택 버튼을 클릭했을 때 호출됨
        onAddHighlight({
            text,
            startOffset,
            endOffset,
            color: color || "#FFEB3B", // 색상은 TextSelectionMenu에서 선택한 값
            pageNumber,
            blockId: blockId || undefined,
            blockType: blockType || undefined,
        });
    };

    // 북마크 추가
    const addBookmark = () => {
        if (!onAddBookmark) return;

        // 현재 페이지가 이미 북마크되었는지 확인
        const existingBookmark = bookmarks.find(bookmark => bookmark.pageNumber === currentPage);
        if (existingBookmark) {
            console.log("이미 북마크된 페이지입니다:", currentPage);
            return;
        }

        const newBookmark = {
            position: 0, // 페이지 기반에서는 의미 없음
            title: currentPageData.title || `페이지 ${currentPage}`,
            pageNumber: currentPage,
        };

        onAddBookmark(newBookmark);
    };

    // 북마크 삭제
    const removeBookmark = (bookmarkId: string) => {
        if (!onDeleteBookmark) return;
        onDeleteBookmark(bookmarkId);
    };

    // 현재 페이지의 북마크 확인
    const currentPageBookmark = realtimeBookmarks.find(bookmark => bookmark.pageNumber === currentPage);
    const isCurrentPageBookmarked = !!currentPageBookmark;

    // 페이지 변경 시 북마크 상태 업데이트
    useEffect(() => {
        // 현재 페이지의 북마크 상태 확인
        const bookmark = realtimeBookmarks.find(bookmark => bookmark.pageNumber === currentPage);
        console.log("현재 페이지 북마크 상태:", { currentPage, isBookmarked: !!bookmark, bookmark });
    }, [currentPage, realtimeBookmarks]);

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

    // 검색 기능 처리
    const handleSearch = (query: string) => {
        console.log("EbookPageViewer 검색 요청:", query);
        if (!query.trim()) {
            onClearSearch();
            return;
        }
        onSearch(query);
    };

    // 테마에 따른 스타일 설정
    const getThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-900 text-white';
            case 'sepia':
                return 'bg-amber-50 text-gray-900';
            default:
                return 'bg-white text-gray-900';
        }
    };

    // 테마에 따른 페이지 콘텐츠 스타일 설정
    const getPageContentStyles = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-800 border-gray-700 shadow-lg shadow-black/30';
            case 'sepia':
                return 'bg-amber-100 border-amber-200 shadow-lg shadow-amber-300/20';
            default:
                return 'bg-white border-gray-200 shadow-lg shadow-gray-200/50';
        }
    };

    // 모바일 환경에서 사이드바가 열릴 때 배경 스크롤 방지
    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, sidebarOpen]);

    return (
        <div className={`flex h-screen overflow-hidden ${getThemeStyles()} ${className}`}>
            {/* 사이드바 */}
            <div
                ref={sidebarRef}
                className={`
                    ${isMobile
                        ? 'fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out shadow-xl'
                        : 'w-72 h-full border-r flex-shrink-0 transition-all duration-300 ease-in-out'
                    }
                    ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
                    ${isMobile ? 'w-[85vw] max-w-[320px]' : 'w-72'}
                    ${getThemeStyles()}
                `}
                style={{
                    backdropFilter: isMobile ? 'blur(8px)' : 'none',
                    WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'none',
                }}
            >
                {sidebarOpen && (
                    <EbookReaderSidebar
                        title={ebook.title}
                        ebookId={ebook.ebook_id}
                        tocItems={tocItems}
                        currentPage={currentPage}
                        activeItemId={activeItemId}
                        onTocItemClick={handleTocItemClick}
                        onBookmarkClick={handleBookmarkClick}
                        onHighlightClick={handleHighlightClick}
                        onUpdateHighlightNote={onUpdateHighlightNote}
                        theme={theme}
                        isMobile={isMobile}
                        onClose={isMobile ? onToggleSidebar : undefined}
                    />
                )}
            </div>

            {/* 모바일 사이드바 오버레이 */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={onToggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* 메인 콘텐츠 */}
            <div
                className={`
                    flex-1 flex flex-col h-full overflow-hidden relative 
                    ${isMobile && sidebarOpen ? 'opacity-50' : 'opacity-100'}
                    transition-opacity duration-300
                `}
            >
                {/* 상단 툴바 */}
                <div className={`flex-shrink-0 sticky top-0 left-0 right-0 z-10 ${getThemeStyles()}`}>
                    <EbookReaderToolbar
                        title={ebook.title}
                        currentPage={currentPage}
                        totalPages={ebook.page_count}
                        fontSize={fontSize}
                        lineHeight={lineHeight}
                        fontFamily={fontFamily}
                        theme={theme}
                        ebookId={ebook.ebook_id}
                        onToggleSidebar={onToggleSidebar}
                        onIncreaseFontSize={onIncreaseFontSize}
                        onDecreaseFontSize={onDecreaseFontSize}
                        onIncreaseLineHeight={onIncreaseLineHeight}
                        onDecreaseLineHeight={onDecreaseLineHeight}
                        onSetFontFamily={onSetFontFamily}
                        onSetTheme={onSetTheme}
                        onGoBack={onGoBack}
                        isCurrentPageBookmarked={isCurrentPageBookmarked}
                        currentPageBookmarkId={currentPageBookmark?.id || ""}
                        searchQuery={searchQuery}
                        onSearch={handleSearch}
                        onNextSearchResult={onNextSearchResult}
                        onPrevSearchResult={onPrevSearchResult}
                        onClearSearch={onClearSearch}
                        searchResultsCount={searchResults.length}
                        currentSearchIndex={currentSearchIndex}
                        searchResults={searchResults}
                        hasActiveSearch={hasActiveSearch}
                        onJumpToPage={onJumpToPage}
                    />
                </div>

                {/* 페이지 콘텐츠 */}
                <div className={`flex-1 overflow-auto py-6 px-4 pb-32 ${getThemeStyles()} transition-colors duration-300`}>
                    <div
                        className={`max-w-3xl w-full mx-auto rounded-xl p-8 min-h-[300px] overflow-auto mb-16 border ${getPageContentStyles()} transition-all duration-300`}
                        style={{
                            fontSize: `${fontSize}px`,
                            lineHeight: lineHeight,
                            fontFamily: fontFamily
                        }}
                    >
                        <PageTransition
                            pages={ebook.pages}
                            currentPage={currentPage}
                            highlights={highlights}
                            onTextSelect={handleTextSelect}
                            onDeleteHighlight={onDeleteHighlight}
                            searchResults={searchResults}
                            currentSearchIndex={currentSearchIndex}
                        />
                    </div>
                </div>

                {/* 하단 네비게이션 */}
                <div className="fixed bottom-0 left-0 right-0 z-50 h-[60px]">
                    <div className={`shadow-lg border-t h-full ${getThemeStyles()} transition-colors duration-300`}>
                        <PageNavigation
                            currentPage={currentPage}
                            totalPages={ebook.page_count}
                            onPrevPage={onPrevPage}
                            onNextPage={onNextPage}
                            onJumpToPage={onJumpToPage}
                            theme={theme}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 