import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { EbookPage, Highlight } from "./types";
import { PageRenderer } from "./page-renderer";

interface PageTransitionProps {
    pages: EbookPage[];
    currentPage: number;
    highlights: Highlight[];
    onTextSelect?: (selection: { text: string; startOffset: number; endOffset: number; pageNumber: number }) => void;
    transitionDuration?: number;
    className?: string;
}

export function PageTransition({
    pages,
    currentPage,
    highlights,
    onTextSelect,
    transitionDuration = 0.3,
    className = "",
}: PageTransitionProps) {
    const [direction, setDirection] = useState(0);
    const [prevPage, setPrevPage] = useState(currentPage);

    // 페이지 변경 방향 감지
    useEffect(() => {
        if (currentPage > prevPage) {
            setDirection(1); // 다음 페이지
        } else if (currentPage < prevPage) {
            setDirection(-1); // 이전 페이지
        }
        setPrevPage(currentPage);
    }, [currentPage, prevPage]);

    // 현재 페이지 데이터
    const currentPageData = pages.find(page => page.page_number === currentPage);

    // 애니메이션 변형
    const getAnimationProps = () => {
        return {
            initial: {
                x: direction > 0 ? "100%" : "-100%",
                opacity: 0
            },
            animate: {
                x: 0,
                opacity: 1
            },
            exit: {
                x: direction < 0 ? "100%" : "-100%",
                opacity: 0
            },
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: transitionDuration },
            }
        };
    };

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <motion.div
                key={currentPage}
                {...getAnimationProps()}
                className="w-full h-full"
            >
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
            </motion.div>
        </div>
    );
} 