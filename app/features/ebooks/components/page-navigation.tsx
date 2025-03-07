import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Slider } from "~/common/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "~/common/components/ui/popover";

interface PageNavigationProps {
    currentPage: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    onJumpToPage?: (pageNumber: number) => void;
    className?: string;
}

export function PageNavigation({
    currentPage,
    totalPages,
    onPrevPage,
    onNextPage,
    onJumpToPage,
    className = "",
}: PageNavigationProps) {
    const [pageInputValue, setPageInputValue] = useState(currentPage.toString());
    const [sliderValue, setSliderValue] = useState(currentPage);

    // 페이지 입력 처리
    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInputValue(e.target.value);
    };

    // 페이지 입력 제출 처리
    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNumber = parseInt(pageInputValue);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages && onJumpToPage) {
            onJumpToPage(pageNumber);
        }
    };

    // 슬라이더 값 변경 처리
    const handleSliderChange = (value: number[]) => {
        setSliderValue(value[0]);
    };

    // 슬라이더 값 변경 완료 처리
    const handleSliderChangeComplete = (value: number[]) => {
        if (onJumpToPage) {
            onJumpToPage(value[0]);
        }
    };

    // 처음 페이지로 이동
    const goToFirstPage = () => {
        if (onJumpToPage) {
            onJumpToPage(1);
        }
    };

    // 마지막 페이지로 이동
    const goToLastPage = () => {
        if (onJumpToPage) {
            onJumpToPage(totalPages);
        }
    };

    return (
        <div className={`flex items-center justify-between p-4 border-t ${className}`}>
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToFirstPage}
                    disabled={currentPage <= 1}
                    title="처음 페이지"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    onClick={onPrevPage}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    이전 페이지
                </Button>
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[100px]">
                        {currentPage} / {totalPages} 페이지
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="space-y-4">
                        <h4 className="font-medium">페이지 이동</h4>
                        <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-2">
                            <Input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={pageInputValue}
                                onChange={handlePageInputChange}
                                className="w-20"
                            />
                            <span>/ {totalPages}</span>
                            <Button type="submit" size="sm">이동</Button>
                        </form>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>1</span>
                                <span>{totalPages}</span>
                            </div>
                            <Slider
                                value={[sliderValue]}
                                min={1}
                                max={totalPages}
                                step={1}
                                onValueChange={handleSliderChange}
                                onValueCommit={handleSliderChangeComplete}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    onClick={onNextPage}
                    disabled={currentPage >= totalPages}
                >
                    다음 페이지
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToLastPage}
                    disabled={currentPage >= totalPages}
                    title="마지막 페이지"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
} 