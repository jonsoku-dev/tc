import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/common/components/ui/button";

interface PageNavigationProps {
    currentPage: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    className?: string;
}

export function PageNavigation({
    currentPage,
    totalPages,
    onPrevPage,
    onNextPage,
    className = "",
}: PageNavigationProps) {
    return (
        <div className={`flex items-center justify-between p-4 border-t ${className}`}>
            <Button
                variant="ghost"
                onClick={onPrevPage}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                이전 페이지
            </Button>
            <div className="text-sm text-gray-500">
                {currentPage} / {totalPages} 페이지
            </div>
            <Button
                variant="ghost"
                onClick={onNextPage}
                disabled={currentPage >= totalPages}
            >
                다음 페이지
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
    );
} 