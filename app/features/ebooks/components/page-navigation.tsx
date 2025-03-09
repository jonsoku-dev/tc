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
                return 'bg-gray-900 text-white border-gray-700 shadow-md shadow-gray-800/20';
            case 'sepia':
                return 'bg-amber-50 text-gray-900 border-amber-200 shadow-md shadow-amber-200/20';
            default:
                return 'bg-white text-gray-900 border-gray-200 shadow-md shadow-gray-200/20';
        }
    };

    // 테마에 따른 버튼 스타일 설정
    const getButtonThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return 'hover:bg-gray-800 text-gray-300 hover:text-white';
            case 'sepia':
                return 'hover:bg-amber-100 text-amber-800 hover:text-amber-900';
            default:
                return 'hover:bg-gray-100 text-gray-700 hover:text-gray-900';
        }
    };

    // 테마에 따른 입력 필드 스타일 설정
    const getInputThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-800 border-gray-700 text-white';
            case 'sepia':
                return 'bg-amber-100 border-amber-200 text-gray-900';
            default:
                return 'bg-white border-gray-200 text-gray-900';
        }
    };

    // 디버깅용 로그
    console.log("PageNavigation 렌더링:", { currentPage, totalPages, sliderValue });

    return (
        <div className={`flex items-center justify-between py-3 px-4 w-full ${getThemeStyles()} ${className} transition-colors duration-300`}>
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={currentPage <= 1}
                    title="처음 페이지"
                    className={`rounded-full w-8 h-8 p-0 flex items-center justify-center ${getButtonThemeStyles()}`}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPrevPage}
                    disabled={currentPage <= 1}
                    className={`rounded-full flex items-center justify-center ${getButtonThemeStyles()}`}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline text-sm">이전</span>
                </Button>
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`min-w-[120px] h-9 rounded-full text-sm font-medium ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : theme === 'sepia' ? 'border-amber-200 bg-amber-100' : ''}`}
                    >
                        <span className="font-medium">{currentPage}</span>
                        <span className="mx-1 text-gray-500 dark:text-gray-400">/</span>
                        <span>{totalPages}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={`w-80 p-4 ${getThemeStyles()}`}>
                    <div className="space-y-5">
                        <h4 className="font-medium text-base">페이지 이동</h4>
                        <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-3">
                            <Input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={pageInputValue}
                                onChange={handlePageInputChange}
                                className={`w-20 rounded-md ${getInputThemeStyles()}`}
                            />
                            <span className="text-gray-500 dark:text-gray-400">/ {totalPages}</span>
                            <Button
                                type="submit"
                                size="sm"
                                className={`rounded-md ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : ''}`}
                            >
                                이동
                            </Button>
                        </form>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
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
                                className={theme === 'dark' ? '[&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-700 [&_[role=slider]]:hover:bg-blue-500' :
                                    theme === 'sepia' ? '[&_[role=slider]]:bg-amber-600 [&_[role=slider]]:border-amber-700 [&_[role=slider]]:hover:bg-amber-500' : ''}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNextPage}
                    disabled={currentPage >= totalPages}
                    className={`rounded-full flex items-center justify-center ${getButtonThemeStyles()}`}
                >
                    <span className="hidden sm:inline text-sm">다음</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage >= totalPages}
                    title="마지막 페이지"
                    className={`rounded-full w-8 h-8 p-0 flex items-center justify-center ${getButtonThemeStyles()}`}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
} 