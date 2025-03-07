import { ArrowLeft, BookmarkPlus, List, Settings, Share } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Label } from "~/common/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/common/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/common/components/ui/tooltip";

interface EbookReaderToolbarProps {
    title: string;
    currentPage: number;
    totalPages: number;
    fontSize: number;
    lineHeight: number;
    onToggleSidebar: () => void;
    onAddBookmark: () => void;
    onIncreaseFontSize: () => void;
    onDecreaseFontSize: () => void;
    onIncreaseLineHeight: () => void;
    onDecreaseLineHeight: () => void;
    onGoBack?: () => void;
    className?: string;
}

export function EbookReaderToolbar({
    title,
    currentPage,
    totalPages,
    fontSize,
    lineHeight,
    onToggleSidebar,
    onAddBookmark,
    onIncreaseFontSize,
    onDecreaseFontSize,
    onIncreaseLineHeight,
    onDecreaseLineHeight,
    onGoBack,
    className = "",
}: EbookReaderToolbarProps) {
    // 디버깅용 로그
    console.log("EbookReaderToolbar 렌더링:", { currentPage, fontSize, lineHeight });

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
                                onClick={onAddBookmark}
                            >
                                <BookmarkPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>북마크 추가</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

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