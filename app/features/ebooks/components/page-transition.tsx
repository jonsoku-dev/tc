import { type EbookPage, type Highlight } from "./types";
import { PageRenderer } from "./page-renderer";
import { useEffect, useRef } from "react";

interface PageTransitionProps {
    pages: EbookPage[];
    currentPage: number;
    highlights: Highlight[];
    onTextSelect?: (selection: { text: string; startOffset: number; endOffset: number; pageNumber: number; blockId: string | null; blockType: string | null; color?: string }) => void;
    onDeleteHighlight?: (highlightId: string) => void;
    className?: string;
    searchResults?: Array<{
        pageNumber: number;
        text: string;
        startOffset: number;
        endOffset: number;
        blockId?: string;
        blockType?: string;
    }>;
    currentSearchIndex?: number;
}

export function PageTransition({
    pages,
    currentPage,
    highlights,
    onTextSelect,
    onDeleteHighlight,
    className = "",
    searchResults = [],
    currentSearchIndex = 0,
}: PageTransitionProps) {
    // 현재 페이지 데이터
    const currentPageData = pages.find(page => page.page_number === currentPage);

    // 현재 페이지의 검색 결과
    const currentPageSearchResults = searchResults.filter(result => result.pageNumber === currentPage);

    // 현재 활성화된 검색 결과
    const activeSearchResult = searchResults.length > 0 && currentSearchIndex < searchResults.length
        ? searchResults[currentSearchIndex]
        : null;

    console.log("PageTransition 렌더링:", {
        currentPage,
        searchResultsCount: searchResults.length,
        currentPageSearchResultsCount: currentPageSearchResults.length,
        activeSearchResult,
        currentSearchIndex
    });

    // 검색 결과가 변경되면 스크롤 위치 조정
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeSearchResult && activeSearchResult.pageNumber === currentPage && contentRef.current) {
            console.log("활성화된 검색 결과 스크롤 시도:", activeSearchResult);

            // 약간의 지연 후 스크롤 시도 (렌더링 완료 후)
            setTimeout(() => {
                // 활성화된 검색 결과 요소 찾기
                let selector = `[data-search-index="${currentSearchIndex}"]`;

                // 블록 ID가 있는 경우 블록 ID로 더 정확하게 찾기
                if (activeSearchResult.blockId) {
                    selector = `[data-block-id="${activeSearchResult.blockId}"] ${selector}`;
                }

                const activeElement = contentRef.current?.querySelector(selector);
                console.log("활성화된 검색 결과 요소:", activeElement, "선택자:", selector);

                if (activeElement) {
                    // 요소가 보이도록 스크롤
                    activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // 강조 표시를 위해 클래스 추가
                    activeElement.classList.add('search-result-active');

                    // 잠시 후 강조 효과 제거
                    setTimeout(() => {
                        activeElement.classList.remove('search-result-active');
                    }, 3000);
                }
            }, 500);
        }
    }, [activeSearchResult, currentPage, currentSearchIndex]);

    return (
        <div className={`relative w-full h-full ${className}`} ref={contentRef}>
            <div className="w-full h-full">
                {currentPageData ? (
                    <PageRenderer
                        page={currentPageData}
                        highlights={highlights.filter(h => h.pageNumber === currentPage)}
                        onTextSelect={onTextSelect}
                        onDeleteHighlight={onDeleteHighlight}
                        searchResults={currentPageSearchResults}
                        activeSearchResult={activeSearchResult}
                        currentSearchIndex={currentSearchIndex}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">페이지를 찾을 수 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 