import { type EbookPage, type Highlight } from "./types";
import { PageRenderer } from "./page-renderer";

interface PageTransitionProps {
    pages: EbookPage[];
    currentPage: number;
    highlights: Highlight[];
    onTextSelect?: (selection: { text: string; startOffset: number; endOffset: number; pageNumber: number; blockId: string | null; blockType: string | null; color?: string }) => void;
    className?: string;
}

export function PageTransition({
    pages,
    currentPage,
    highlights,
    onTextSelect,
    className = "",
}: PageTransitionProps) {
    // 현재 페이지 데이터
    const currentPageData = pages.find(page => page.page_number === currentPage);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <div className="w-full h-full">
                {currentPageData ? (
                    <PageRenderer
                        page={currentPageData}
                        highlights={highlights.filter(h => h.pageNumber === currentPage)}
                        onTextSelect={onTextSelect}
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