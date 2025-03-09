import { ArrowLeft, BookmarkPlus, List, Settings, Share, Bookmark } from "lucide-react";
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

interface EbookReaderToolbarProps {
    title: string;
    currentPage: number;
    totalPages: number;
    fontSize: number;
    lineHeight: number;
    ebookId: string;
    onToggleSidebar: () => void;
    onIncreaseFontSize: () => void;
    onDecreaseFontSize: () => void;
    onIncreaseLineHeight: () => void;
    onDecreaseLineHeight: () => void;
    onGoBack?: () => void;
    className?: string;
    isCurrentPageBookmarked?: boolean;
    currentPageBookmarkId?: string;
}

export function EbookReaderToolbar({
    title,
    currentPage,
    totalPages,
    fontSize,
    lineHeight,
    ebookId,
    onToggleSidebar,
    onIncreaseFontSize,
    onDecreaseFontSize,
    onIncreaseLineHeight,
    onDecreaseLineHeight,
    onGoBack,
    className = "",
    isCurrentPageBookmarked = false,
    currentPageBookmarkId = "",
}: EbookReaderToolbarProps) {
    // 디버깅용 로그
    console.log("EbookReaderToolbar 렌더링:", { currentPage, fontSize, lineHeight, isCurrentPageBookmarked });

    // 북마크 다이얼로그 상태
    const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
    const [showRemoveBookmarkDialog, setShowRemoveBookmarkDialog] = useState(false);

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

    return (
        <div className={`flex items-center justify-between p-4 border-b bg-white w-full ${className}`}>
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
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </TooltipTrigger>
                        <TooltipContent>설정</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Share className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>공유</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
} 