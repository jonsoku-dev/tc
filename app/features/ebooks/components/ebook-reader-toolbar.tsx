import { ArrowLeft, BookmarkPlus, List, Settings, Share, Bookmark, Search, ChevronUp, ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Label } from "~/common/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/common/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/common/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "~/common/components/ui/alert";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/common/components/ui/dialog";
import { useCreateBookmark, useDeleteBookmark } from "../hooks/use-bookmark-api";
import { EBOOK_QUERY_KEYS } from "../constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "~/common/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/common/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { ScrollArea } from "~/common/components/ui/scroll-area";

interface EbookReaderToolbarProps {
    title: string;
    currentPage: number;
    totalPages: number;
    fontSize: number;
    lineHeight: number;
    fontFamily: string;
    theme: 'light' | 'dark' | 'sepia';
    ebookId: string;
    onToggleSidebar: () => void;
    onIncreaseFontSize: () => void;
    onDecreaseFontSize: () => void;
    onIncreaseLineHeight: () => void;
    onDecreaseLineHeight: () => void;
    onSetFontFamily: (fontFamily: string) => void;
    onSetTheme: (theme: 'light' | 'dark' | 'sepia') => void;
    onGoBack?: () => void;
    className?: string;
    isCurrentPageBookmarked?: boolean;
    currentPageBookmarkId?: string;
    searchQuery?: string;
    onSearch?: (query: string) => void;
    onNextSearchResult?: () => void;
    onPrevSearchResult?: () => void;
    onClearSearch?: () => void;
    searchResultsCount?: number;
    currentSearchIndex?: number;
    hasActiveSearch?: boolean;
    searchResults?: Array<{
        pageNumber: number;
        text: string;
        startOffset: number;
        endOffset: number;
        blockId?: string;
        blockType?: string;
    }>;
    onJumpToPage?: (pageNumber: number) => void;
}

export function EbookReaderToolbar({
    title,
    currentPage,
    totalPages,
    fontSize,
    lineHeight,
    fontFamily,
    theme,
    ebookId,
    onToggleSidebar,
    onIncreaseFontSize,
    onDecreaseFontSize,
    onIncreaseLineHeight,
    onDecreaseLineHeight,
    onSetFontFamily,
    onSetTheme,
    onGoBack,
    className = "",
    isCurrentPageBookmarked = false,
    currentPageBookmarkId = "",
    searchQuery = "",
    onSearch = () => { },
    onNextSearchResult = () => { },
    onPrevSearchResult = () => { },
    onClearSearch = () => { },
    searchResultsCount = 0,
    currentSearchIndex = 0,
    hasActiveSearch = false,
    searchResults = [],
    onJumpToPage = () => { },
}: EbookReaderToolbarProps) {
    // 디버깅용 로그
    console.log("EbookReaderToolbar 렌더링:", { currentPage, fontSize, lineHeight, isCurrentPageBookmarked });

    // 북마크 다이얼로그 상태
    const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
    const [showRemoveBookmarkDialog, setShowRemoveBookmarkDialog] = useState(false);

    // 검색 상태
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [isSearching, setIsSearching] = useState(false);

    // 검색 결과가 활성화되어 있는지 확인 (props에서 받은 값 사용)
    // const hasActiveSearch = searchResults && searchResults.length > 0;

    // 쿼리 클라이언트 및 북마크 관련 훅
    const queryClient = useQueryClient();
    const createBookmarkMutation = useCreateBookmark(ebookId);
    const deleteBookmarkMutation = useDeleteBookmark(ebookId);

    // 북마크 추가/삭제 핸들러
    const handleBookmarkAction = () => {
        if (isCurrentPageBookmarked) {
            setShowRemoveBookmarkDialog(true);
        } else {
            setShowBookmarkDialog(true);
        }
    };

    // 북마크 추가 확인 핸들러
    const handleConfirmAddBookmark = () => {
        const newBookmark = {
            position: 0,
            title: `페이지 ${currentPage}`,
            pageNumber: currentPage,
        };

        createBookmarkMutation.mutate(newBookmark, {
            onSuccess: () => {
                console.log("북마크가 성공적으로 추가되었습니다.");
                setShowBookmarkDialog(false);
            },
            onError: (error) => {
                console.error("북마크 추가 중 오류 발생:", error);
                setShowBookmarkDialog(false);
            }
        });
    };

    // 북마크 삭제 확인 핸들러
    const handleConfirmRemoveBookmark = () => {
        if (currentPageBookmarkId) {
            deleteBookmarkMutation.mutate(currentPageBookmarkId, {
                onSuccess: () => {
                    console.log("북마크가 성공적으로 삭제되었습니다.");
                    setShowRemoveBookmarkDialog(false);
                },
                onError: (error) => {
                    console.error("북마크 삭제 중 오류 발생:", error);
                    setShowRemoveBookmarkDialog(false);
                }
            });
        }
    };

    // 검색 다이얼로그 열기
    const handleOpenSearchDialog = () => {
        // 이미 검색 결과가 있는 경우, 다이얼로그를 열 때 기존 검색어 유지
        if (hasActiveSearch) {
            setLocalSearchQuery(searchQuery);
        } else {
            setLocalSearchQuery("");
            onClearSearch();
        }
        setShowSearchDialog(true);
    };

    // 검색 다이얼로그 닫기
    const handleCloseSearchDialog = () => {
        setShowSearchDialog(false);
    };

    // 검색 결과 초기화
    const handleClearSearch = () => {
        setLocalSearchQuery("");
        onClearSearch();
        setShowSearchDialog(false);
    };

    // 검색 핸들러
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localSearchQuery.trim()) {
            setIsSearching(true);
            onSearch(localSearchQuery);

            // 검색 완료 후 로딩 상태 해제
            setTimeout(() => {
                setIsSearching(false);
            }, 1000);
        }
    };

    // 검색 입력 변경 핸들러
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearchQuery(e.target.value);
    };

    // 검색 결과 클릭 핸들러
    const handleSearchResultClick = (pageNumber: number, index: number) => {
        console.log("검색 결과 클릭:", pageNumber, index);

        // 다이얼로그 닫기
        setShowSearchDialog(false);

        // 해당 페이지로 이동
        onJumpToPage(pageNumber);

        // 검색 결과 인덱스 설정 (하이라이트 표시를 위해)
        if (searchResults && searchResults.length > 0) {
            // 전체 검색 결과에서 해당 항목의 인덱스 찾기
            const resultIndex = searchResults.findIndex(
                (result, i) => i === index
            );
            if (resultIndex !== -1) {
                console.log("검색 결과 인덱스 설정:", resultIndex);

                // 약간의 지연 후 검색 결과로 이동 (페이지 전환 후)
                setTimeout(() => {
                    // 현재 검색 인덱스 설정
                    onNextSearchResult();
                    onPrevSearchResult();

                    // 3초 후에 검색 결과 하이라이트 제거 (선택 사항)
                    // setTimeout(() => {
                    //     onClearSearch();
                    // }, 3000);
                }, 500);
            }
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
    const getButtonThemeStyles = (isActive = false) => {
        switch (theme) {
            case 'dark':
                return isActive
                    ? 'bg-blue-900 text-blue-100 hover:bg-blue-800'
                    : 'hover:bg-gray-800 text-gray-300 hover:text-white';
            case 'sepia':
                return isActive
                    ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                    : 'hover:bg-amber-100 text-amber-800 hover:text-amber-900';
            default:
                return isActive
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900';
        }
    };

    // 테마에 따른 다이얼로그 스타일 설정
    const getDialogThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-800 text-white border-gray-700';
            case 'sepia':
                return 'bg-amber-50 text-gray-900 border-amber-200';
            default:
                return 'bg-white text-gray-900 border-gray-200';
        }
    };

    // 테마에 따른 검색 결과 스타일 설정
    const getSearchResultThemeStyles = (isActive = false) => {
        switch (theme) {
            case 'dark':
                return isActive
                    ? 'bg-blue-900 dark:bg-blue-900 border-l-4 border-blue-500'
                    : 'hover:bg-gray-700';
            case 'sepia':
                return isActive
                    ? 'bg-amber-200 border-l-4 border-amber-500'
                    : 'hover:bg-amber-100';
            default:
                return isActive
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100';
        }
    };

    // 블록 타입 레이블 가져오기
    const getBlockTypeLabel = (blockType: string): string => {
        switch (blockType) {
            case 'title':
                return '제목';
            case 'paragraph':
                return '문단';
            case 'heading':
                return '제목';
            case 'image':
                return '이미지';
            case 'code':
                return '코드';
            case 'table':
                return '표';
            case 'video':
                return '비디오';
            case 'audio':
                return '오디오';
            case 'markdown':
                return '마크다운';
            default:
                return blockType;
        }
    };

    return (
        <div className={`flex items-center justify-between py-2.5 px-4 border-b w-full sticky top-0 z-10 ${getThemeStyles()} ${className}`}>
            <div className="flex items-center space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onGoBack}
                                className={`rounded-full w-8 h-8 p-0 flex items-center justify-center ${getButtonThemeStyles()}`}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">뒤로가기</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSidebar}
                    className={`rounded-full w-8 h-8 p-0 flex items-center justify-center ${getButtonThemeStyles()}`}
                >
                    <List className="h-4 w-4" />
                </Button>
                <div className="hidden md:block ml-2 font-medium truncate max-w-[300px]" title={title}>
                    {title}
                </div>
            </div>

            <div className="flex items-center space-x-2">
                {/* 검색 아이콘 */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative">
                                <Button
                                    variant={hasActiveSearch ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={handleOpenSearchDialog}
                                    className={`rounded-full w-8 h-8 p-0 flex items-center justify-center ${hasActiveSearch ? getButtonThemeStyles(true) : getButtonThemeStyles()}`}
                                >
                                    <Search className={`h-4 w-4 ${hasActiveSearch ? "text-blue-700 dark:text-blue-300" : ""}`} />
                                    {hasActiveSearch && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 text-[9px] text-white justify-center items-center">
                                                {searchResults.length}
                                            </span>
                                        </span>
                                    )}
                                </Button>
                                {hasActiveSearch && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearSearch}
                                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-0 flex items-center justify-center"
                                        title="검색 결과 지우기"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            {hasActiveSearch ? "검색 결과 보기" : "검색"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBookmarkAction}
                                className={`rounded-full w-8 h-8 p-0 flex items-center justify-center ${isCurrentPageBookmarked ? "text-yellow-500" : getButtonThemeStyles()}`}
                            >
                                {isCurrentPageBookmarked ? (
                                    <Bookmark className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                ) : (
                                    <BookmarkPlus className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            {isCurrentPageBookmarked ? "북마크 삭제" : "북마크 추가"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`rounded-full w-8 h-8 p-0 flex items-center justify-center ${getButtonThemeStyles()}`}
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className={`w-80 p-4 ${getDialogThemeStyles()}`}>
                                    <div className="space-y-5">
                                        <h3 className="font-medium text-base mb-3">설정</h3>

                                        {/* 글꼴 크기 설정 */}
                                        <div className="space-y-3">
                                            <Label htmlFor="font-size" className="text-sm font-medium">글꼴 크기</Label>
                                            <div className="flex items-center space-x-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onDecreaseFontSize}
                                                    className={`w-8 h-8 rounded-full ${getButtonThemeStyles()}`}
                                                >
                                                    -
                                                </Button>
                                                <div className="flex-1 text-center font-medium">{fontSize}px</div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onIncreaseFontSize}
                                                    className={`w-8 h-8 rounded-full ${getButtonThemeStyles()}`}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 줄 간격 설정 */}
                                        <div className="space-y-3">
                                            <Label htmlFor="line-height" className="text-sm font-medium">줄 간격</Label>
                                            <div className="flex items-center space-x-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onDecreaseLineHeight}
                                                    className={`w-8 h-8 rounded-full ${getButtonThemeStyles()}`}
                                                >
                                                    -
                                                </Button>
                                                <div className="flex-1 text-center font-medium">{lineHeight.toFixed(1)}</div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onIncreaseLineHeight}
                                                    className={`w-8 h-8 rounded-full ${getButtonThemeStyles()}`}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 글꼴 종류 설정 */}
                                        <div className="space-y-3">
                                            <Label htmlFor="font-family" className="text-sm font-medium">글꼴 종류</Label>
                                            <Select
                                                value={fontFamily}
                                                onValueChange={onSetFontFamily}
                                            >
                                                <SelectTrigger className={`rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : theme === 'sepia' ? 'bg-amber-100 border-amber-200' : ''}`}>
                                                    <SelectValue placeholder="글꼴 선택" />
                                                </SelectTrigger>
                                                <SelectContent className={getDialogThemeStyles()}>
                                                    <SelectItem value="Noto Sans KR, sans-serif">Noto Sans KR</SelectItem>
                                                    <SelectItem value="Noto Serif KR, serif">Noto Serif KR</SelectItem>
                                                    <SelectItem value="Pretendard, sans-serif">Pretendard</SelectItem>
                                                    <SelectItem value="Gowun Dodum, sans-serif">고운돋움</SelectItem>
                                                    <SelectItem value="Gowun Batang, serif">고운바탕</SelectItem>
                                                    <SelectItem value="Nanum Gothic, sans-serif">나눔고딕</SelectItem>
                                                    <SelectItem value="Nanum Myeongjo, serif">나눔명조</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* 테마 설정 */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">테마</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <Button
                                                    variant={theme === 'light' ? 'default' : 'outline'}
                                                    className="w-full justify-start px-3 py-2 h-auto rounded-md"
                                                    onClick={() => onSetTheme('light')}
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-white border border-gray-300 mr-2"></div>
                                                    <span>밝은</span>
                                                </Button>
                                                <Button
                                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                                    className="w-full justify-start px-3 py-2 h-auto rounded-md"
                                                    onClick={() => onSetTheme('dark')}
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-gray-900 border border-gray-700 mr-2"></div>
                                                    <span>어두운</span>
                                                </Button>
                                                <Button
                                                    variant={theme === 'sepia' ? 'default' : 'outline'}
                                                    className="w-full justify-start px-3 py-2 h-auto rounded-md"
                                                    onClick={() => onSetTheme('sepia')}
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200 mr-2"></div>
                                                    <span>세피아</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">설정</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* 북마크 추가 다이얼로그 */}
            <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
                <DialogContent className={`sm:max-w-md ${getDialogThemeStyles()}`}>
                    <DialogHeader>
                        <DialogTitle>북마크 추가</DialogTitle>
                    </DialogHeader>
                    <Alert>
                        <AlertTitle>북마크를 추가하시겠습니까?</AlertTitle>
                        <AlertDescription>
                            현재 페이지({currentPage})에 북마크를 추가합니다.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setShowBookmarkDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleConfirmAddBookmark}>
                            추가
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 북마크 삭제 다이얼로그 */}
            <Dialog open={showRemoveBookmarkDialog} onOpenChange={setShowRemoveBookmarkDialog}>
                <DialogContent className={`sm:max-w-md ${getDialogThemeStyles()}`}>
                    <DialogHeader>
                        <DialogTitle>북마크 삭제</DialogTitle>
                    </DialogHeader>
                    <Alert variant="destructive">
                        <AlertTitle>북마크를 삭제하시겠습니까?</AlertTitle>
                        <AlertDescription>
                            현재 페이지({currentPage})의 북마크를 삭제합니다.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setShowRemoveBookmarkDialog(false)}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmRemoveBookmark}>
                            삭제
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 검색 다이얼로그 */}
            <Dialog open={showSearchDialog} onOpenChange={handleCloseSearchDialog}>
                <DialogContent className={`sm:max-w-md ${getDialogThemeStyles()}`}>
                    <DialogHeader>
                        <DialogTitle>
                            {hasActiveSearch ? (
                                <div className="flex items-center">
                                    <span>검색 결과: "{searchQuery}"</span>
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        {searchResults.length}개
                                    </span>
                                </div>
                            ) : (
                                "검색"
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 mb-4">
                            <Input
                                type="text"
                                placeholder="검색어를 입력하세요"
                                value={localSearchQuery}
                                onChange={handleSearchInputChange}
                                className={`flex-1 rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : theme === 'sepia' ? 'bg-amber-100 border-amber-200' : ''}`}
                                autoFocus
                            />
                            <Button type="submit" disabled={isSearching} className={`rounded-md ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : ''}`}>
                                {isSearching ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Search className="h-4 w-4 mr-2" />
                                )}
                                검색
                            </Button>
                            {hasActiveSearch && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleClearSearch}
                                    title="검색 결과 지우기"
                                    className={`rounded-md ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </form>

                        {isSearching ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">검색 중...</span>
                            </div>
                        ) : searchResults && searchResults.length > 0 ? (
                            <div>
                                <div className="text-sm mb-3 flex justify-between items-center">
                                    <span>검색 결과: {searchResults.length}개</span>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onPrevSearchResult}
                                            disabled={searchResults.length <= 1}
                                            className={`h-7 px-2 rounded-md ${getButtonThemeStyles()}`}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs font-medium px-1">
                                            {currentSearchIndex + 1}/{searchResults.length}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onNextSearchResult}
                                            disabled={searchResults.length <= 1}
                                            className={`h-7 px-2 rounded-md ${getButtonThemeStyles()}`}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <ScrollArea className="h-[300px] pr-2">
                                    <div className="space-y-2">
                                        {searchResults.map((result, index) => (
                                            <div
                                                key={`${result.pageNumber}-${result.startOffset}-${result.blockId || 'none'}`}
                                                className={`p-3 rounded-md cursor-pointer transition-all duration-200 ${getSearchResultThemeStyles(index === currentSearchIndex)}`}
                                                onClick={() => handleSearchResultClick(result.pageNumber, index)}
                                            >
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-sm font-medium">페이지 {result.pageNumber}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
                                                </div>
                                                {result.blockType && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                                        {getBlockTypeLabel(result.blockType)}
                                                    </div>
                                                )}
                                                <p className="text-sm leading-relaxed">
                                                    ...{result.text}...
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : localSearchQuery ? (
                            <div className="text-center py-8">
                                <p>검색 결과가 없습니다.</p>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>검색어를 입력하세요.</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex justify-between space-x-2 mt-4">
                        {hasActiveSearch && (
                            <Button
                                variant="outline"
                                onClick={handleClearSearch}
                                className={`mr-auto rounded-md ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                            >
                                검색 결과 지우기
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleCloseSearchDialog}
                            className={`rounded-md ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : ''}`}
                        >
                            닫기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 