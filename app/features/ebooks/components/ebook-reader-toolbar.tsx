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
                return 'bg-gray-900 text-white border-gray-700';
            case 'sepia':
                return 'bg-amber-50 text-gray-900 border-amber-200';
            default:
                return 'bg-white text-gray-900 border-gray-200';
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
        <div className={`flex items-center justify-between p-4 border-b w-full ${className}`}>
            <div className="flex items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onGoBack}
                                className="mr-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>뒤로가기</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="mr-2"
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>

            <div className="text-sm text-gray-500">
                {currentPage} / {totalPages} 페이지
            </div>

            <div className="flex items-center space-x-2">
                {/* 검색 아이콘 */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative">
                                <Button
                                    variant={hasActiveSearch ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={handleOpenSearchDialog}
                                    className={hasActiveSearch ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}
                                >
                                    <Search className={`h-4 w-4 ${hasActiveSearch ? "text-blue-700" : ""}`} />
                                    {hasActiveSearch && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 text-[8px] text-white justify-center items-center">
                                                {searchResults.length}
                                            </span>
                                        </span>
                                    )}
                                </Button>
                                {hasActiveSearch && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearSearch}
                                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-200 hover:bg-gray-300 p-0"
                                        title="검색 결과 지우기"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {hasActiveSearch ? "검색 결과 보기" : "검색"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBookmarkAction}
                                className={isCurrentPageBookmarked ? "text-yellow-500" : ""}
                            >
                                {isCurrentPageBookmarked ? (
                                    <Bookmark className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                ) : (
                                    <BookmarkPlus className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isCurrentPageBookmarked ? "북마크 삭제" : "북마크 추가"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* 북마크 추가 다이얼로그 */}
                <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
                    <DialogContent className="sm:max-w-md">
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
                    <DialogContent className="sm:max-w-md">
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
                    <DialogContent className={`sm:max-w-md ${getThemeStyles()}`}>
                        <DialogHeader>
                            <DialogTitle>
                                {hasActiveSearch ? (
                                    <div className="flex items-center">
                                        <span>검색 결과: "{searchQuery}"</span>
                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                                    className="flex-1"
                                    autoFocus
                                />
                                <Button type="submit" disabled={isSearching}>
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
                                    <div className="text-sm mb-2 flex justify-between items-center">
                                        <span>검색 결과: {searchResults.length}개</span>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onPrevSearchResult}
                                                disabled={searchResults.length <= 1}
                                                className="h-7 px-2"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <span className="text-xs">
                                                {currentSearchIndex + 1}/{searchResults.length}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onNextSearchResult}
                                                disabled={searchResults.length <= 1}
                                                className="h-7 px-2"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <ScrollArea className="h-[300px]">
                                        <div className="space-y-2">
                                            {searchResults.map((result, index) => (
                                                <div
                                                    key={`${result.pageNumber}-${result.startOffset}-${result.blockId || 'none'}`}
                                                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${index === currentSearchIndex ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500' : ''
                                                        }`}
                                                    onClick={() => handleSearchResultClick(result.pageNumber, index)}
                                                >
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm font-medium">페이지 {result.pageNumber}</span>
                                                        <span className="text-xs text-gray-500">#{index + 1}</span>
                                                    </div>
                                                    {result.blockType && (
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            {getBlockTypeLabel(result.blockType)}
                                                        </div>
                                                    )}
                                                    <p className="text-sm">
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
                                <div className="text-center py-8 text-gray-500">
                                    <p>검색어를 입력하세요.</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="flex justify-between space-x-2 mt-4">
                            {hasActiveSearch && (
                                <Button variant="outline" onClick={handleClearSearch} className="mr-auto">
                                    검색 결과 지우기
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleCloseSearchDialog}>
                                닫기
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-4">
                                        <h3 className="font-medium">설정</h3>

                                        {/* 글꼴 크기 설정 */}
                                        <div className="space-y-2">
                                            <Label htmlFor="font-size">글꼴 크기</Label>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onDecreaseFontSize}
                                                >
                                                    -
                                                </Button>
                                                <div className="flex-1 text-center">{fontSize}px</div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onIncreaseFontSize}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 줄 간격 설정 */}
                                        <div className="space-y-2">
                                            <Label htmlFor="line-height">줄 간격</Label>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onDecreaseLineHeight}
                                                >
                                                    -
                                                </Button>
                                                <div className="flex-1 text-center">{lineHeight.toFixed(1)}</div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={onIncreaseLineHeight}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 글꼴 종류 설정 */}
                                        <div className="space-y-2">
                                            <Label htmlFor="font-family">글꼴 종류</Label>
                                            <Select
                                                value={fontFamily}
                                                onValueChange={onSetFontFamily}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="글꼴 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
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
                                        <div className="space-y-2">
                                            <Label>테마</Label>
                                            <RadioGroup
                                                value={theme}
                                                onValueChange={(value) => onSetTheme(value as 'light' | 'dark' | 'sepia')}
                                                className="flex space-x-2"
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <RadioGroupItem value="light" id="theme-light" />
                                                    <Label htmlFor="theme-light" className="cursor-pointer">밝은</Label>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <RadioGroupItem value="dark" id="theme-dark" />
                                                    <Label htmlFor="theme-dark" className="cursor-pointer">어두운</Label>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <RadioGroupItem value="sepia" id="theme-sepia" />
                                                    <Label htmlFor="theme-sepia" className="cursor-pointer">세피아</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </TooltipTrigger>
                        <TooltipContent>설정</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
} 