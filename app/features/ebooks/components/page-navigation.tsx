import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Slider } from "~/common/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "~/common/components/ui/popover";

// debounce 유틸리티 함수
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

interface PageNavigationProps {
    currentPage: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    onJumpToPage?: (pageNumber: number) => void;
    className?: string;
    theme?: 'light' | 'dark' | 'sepia';
}

export function PageNavigation({
    currentPage,
    totalPages,
    onPrevPage,
    onNextPage,
    onJumpToPage,
    className = "",
    theme = "light",
}: PageNavigationProps) {
    // XState와 연동을 위해 로컬 상태 대신 currentPage를 직접 사용
    const [pageInputValue, setPageInputValue] = useState(currentPage.toString());
    const [sliderValue, setSliderValue] = useState(currentPage);

    // currentPage가 변경될 때 pageInputValue와 sliderValue 업데이트
    useEffect(() => {
        setPageInputValue(currentPage.toString());
        setSliderValue(currentPage);
    }, [currentPage]);

    // debounce된 페이지 점프 함수
    const debouncedJumpToPage = useCallback(
        debounce((pageNumber: number) => {
            if (onJumpToPage) {
                onJumpToPage(pageNumber);
            }
        }, 300), // 300ms 딜레이
        [onJumpToPage]
    );

    // 페이지 입력 처리 - debounce 적용
    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPageInputValue(value);

        // 유효한 숫자인 경우 debounce 적용하여 XState 업데이트
        const pageNumber = parseInt(value);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            debouncedJumpToPage(pageNumber);
        }
    };

    // 페이지 입력 제출 처리
    const handlePageInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNumber = parseInt(pageInputValue);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages && onJumpToPage) {
            onJumpToPage(pageNumber); // 제출 시에는 즉시 업데이트
        }
    };

    // 슬라이더 값 변경 처리 - 로컬 상태 업데이트 및 debounce 적용
    const handleSliderChange = (value: number[]) => {
        setSliderValue(value[0]);
        debouncedJumpToPage(value[0]);
    };

    // 슬라이더 값 변경 완료 처리 - 즉시 업데이트
    const handleSliderChangeComplete = (value: number[]) => {
        if (onJumpToPage) {
            onJumpToPage(value[0]); // 드래그 완료 시에는 즉시 업데이트
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

    // 테마에 따른 스타일 설정
    const getThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-900 text-white border-gray-700';
            case 'sepia':
                return 'bg-amber-50 text-gray-900 border-amber-200';
            default:
                return 'bg-white text-gray-900 border-gray-200';
        }
    };

    // 디버깅용 로그
    console.log("PageNavigation 렌더링:", { currentPage, totalPages, sliderValue });

    return (
        <div className={`flex items-center justify-between p-4 w-full ${getThemeStyles()} ${className}`}>
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToFirstPage}
                    disabled={currentPage <= 1}
                    title="처음 페이지"
                    className="h-9 w-9"
                >
                    <ChevronsLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    onClick={onPrevPage}
                    disabled={currentPage <= 1}
                    className="h-9"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    이전
                </Button>
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[100px] h-9">
                        {currentPage} / {totalPages}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={`w-80 ${getThemeStyles()}`}>
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
                                value={[sliderValue]} // 로컬 상태 사용
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
                    className="h-9"
                >
                    다음
                    <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToLastPage}
                    disabled={currentPage >= totalPages}
                    title="마지막 페이지"
                    className="h-9 w-9"
                >
                    <ChevronsRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
} 