import { X, ChevronDown, Bookmark, Trash2 } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { useSupabase } from "~/common/hooks/use-supabase";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Switch } from "~/common/components/ui/switch";
import { Label } from "~/common/components/ui/label";
import { HighlightTab } from "./highlight-tab";
import { EBOOK_QUERY_KEYS } from "../constants/query-keys";
import type { Highlight } from "./types";
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from "../hooks/use-bookmark-api";
import { useHighlights } from "../hooks/use-highlight-api";
import { Alert, AlertDescription, AlertTitle } from "~/common/components/ui/alert";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/common/components/ui/dialog";

interface TocItem {
    id: string;
    title: string;
    level: number;
    position: number;
    pageNumber: number;
}

interface BookmarkItem {
    id: string;
    position: number;
    title: string;
    createdAt: Date;
    pageNumber: number;
}

interface TocTabProps {
    tocItems: TocItem[];
    currentPage: number;
    activeItemId: string | null;
    onTocItemClick: (item: TocItem) => void;
    theme?: 'light' | 'dark' | 'sepia';
}

function TocTab({ tocItems, currentPage, activeItemId, onTocItemClick, theme = 'light' }: TocTabProps) {
    // 테마에 따른 항목 스타일 설정
    const getItemThemeStyles = (isActive = false, isCurrent = false) => {
        switch (theme) {
            case 'dark':
                return isActive
                    ? 'bg-blue-900/30 text-blue-300 border-l-4 border-blue-500'
                    : isCurrent
                        ? 'bg-gray-800 text-gray-200 border-l-2 border-gray-600'
                        : 'hover:bg-gray-800/70 text-gray-300';
            case 'sepia':
                return isActive
                    ? 'bg-amber-200 text-amber-900 border-l-4 border-amber-600'
                    : isCurrent
                        ? 'bg-amber-100 text-amber-900 border-l-2 border-amber-400'
                        : 'hover:bg-amber-100/70 text-amber-800';
            default:
                return isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : isCurrent
                        ? 'bg-gray-100 text-gray-900 border-l-2 border-gray-300'
                        : 'hover:bg-gray-100/70 text-gray-700';
        }
    };

    // 레벨에 따른 들여쓰기 계산
    const getIndentStyle = (level: number) => {
        // 기본 패딩 + 레벨에 따른 추가 패딩
        return { paddingLeft: `${0.75 + (level - 1) * 0.75}rem` };
    };

    return (
        <ScrollArea className="h-full">
            <div className="py-2 px-1">
                {tocItems.length === 0 ? (
                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-amber-700' : 'text-gray-500'}`}>
                        목차가 없습니다.
                    </div>
                ) : (
                    <div className="space-y-[2px]">
                        {tocItems.map((item) => (
                            <div
                                key={item.id}
                                className={`group flex items-center py-2 px-3 rounded-md cursor-pointer transition-all duration-200 ${getItemThemeStyles(activeItemId === item.id, item.pageNumber === currentPage)}`}
                                style={getIndentStyle(item.level)}
                                onClick={() => onTocItemClick(item)}
                            >
                                <span className="truncate text-sm font-medium">{item.title}</span>
                                {item.pageNumber === currentPage && (
                                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[40px] ${theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300'
                                        : theme === 'sepia'
                                            ? 'bg-amber-200 text-amber-800'
                                            : 'bg-gray-200 text-gray-700'
                                        }`}>
                                        현재
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}

interface BookmarkTabProps {
    ebookId: string;
    currentPage: number;
    onBookmarkClick: (bookmark: BookmarkItem) => void;
    theme?: 'light' | 'dark' | 'sepia';
}

function BookmarkTab({ ebookId, currentPage, onBookmarkClick, theme = 'light' }: BookmarkTabProps) {
    const { data, status } = useBookmarks(ebookId);
    const deleteBookmarkMutation = useDeleteBookmark(ebookId);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);

    // 북마크 데이터 추출
    const bookmarks = data?.pages?.[0]?.bookmarks || [];
    const isLoading = status === 'pending';
    const hasError = status === 'error';

    // 테마에 따른 항목 스타일 설정
    const getItemThemeStyles = (isCurrent = false) => {
        switch (theme) {
            case 'dark':
                return isCurrent
                    ? 'bg-gray-800 text-gray-200 border-l-4 border-yellow-500'
                    : 'hover:bg-gray-800/70 text-gray-300';
            case 'sepia':
                return isCurrent
                    ? 'bg-amber-100 text-amber-900 border-l-4 border-yellow-600'
                    : 'hover:bg-amber-100/70 text-amber-800';
            default:
                return isCurrent
                    ? 'bg-yellow-50 text-gray-900 border-l-4 border-yellow-500'
                    : 'hover:bg-gray-100/70 text-gray-700';
        }
    };

    const handleDeleteBookmark = (bookmarkId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBookmarkToDelete(bookmarkId);
        setShowDeleteDialog(true);
    };

    const confirmDeleteBookmark = () => {
        if (bookmarkToDelete) {
            deleteBookmarkMutation.mutate(bookmarkToDelete);
            setShowDeleteDialog(false);
            setBookmarkToDelete(null);
        }
    };

    const handleBookmarkClick = (bookmark: BookmarkItem) => {
        onBookmarkClick(bookmark);
    };

    if (isLoading) {
        return (
            <div className={`flex justify-center items-center h-full ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-amber-700' : 'text-gray-500'}`}>
                북마크 로딩 중...
            </div>
        );
    }

    if (hasError) {
        return (
            <div className={`text-center py-4 ${theme === 'dark' ? 'text-red-400' : theme === 'sepia' ? 'text-red-700' : 'text-red-500'}`}>
                북마크를 불러오는 중 오류가 발생했습니다.
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
                <div className="py-2 px-1">
                    {bookmarks.length === 0 ? (
                        <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-amber-700' : 'text-gray-500'}`}>
                            북마크가 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-[3px]">
                            {bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.id}
                                    className={`group flex items-start py-2.5 px-3 rounded-md cursor-pointer transition-all duration-200 ${getItemThemeStyles(bookmark.pageNumber === currentPage)}`}
                                    onClick={() => handleBookmarkClick(bookmark)}
                                >
                                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                                        <Bookmark className={`h-4 w-4 mt-0.5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} flex-shrink-0`} />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="truncate text-sm font-medium">{bookmark.title || `페이지 ${bookmark.pageNumber}`}</span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0 ${theme === 'dark'
                                                    ? 'bg-gray-700 text-gray-300'
                                                    : theme === 'sepia'
                                                        ? 'bg-amber-200 text-amber-800'
                                                        : 'bg-gray-200 text-gray-700'
                                                    }`}>
                                                    P.{bookmark.pageNumber}
                                                </span>
                                            </div>
                                            <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : theme === 'sepia' ? 'text-amber-700/80' : 'text-gray-500'}`}>
                                                {new Date(bookmark.createdAt).toLocaleDateString()} {new Date(bookmark.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-7 w-7 ml-1 opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark'
                                            ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                                            : theme === 'sepia'
                                                ? 'hover:bg-amber-200 text-amber-700 hover:text-red-600'
                                                : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                                            }`}
                                        onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : theme === 'sepia' ? 'bg-amber-50 text-gray-900 border-amber-200' : ''}>
                    <DialogHeader>
                        <DialogTitle>북마크 삭제</DialogTitle>
                    </DialogHeader>
                    <Alert variant="destructive">
                        <AlertTitle>북마크를 삭제하시겠습니까?</AlertTitle>
                        <AlertDescription>
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteBookmark}>
                            삭제
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface EbookReaderSidebarProps {
    title: string;
    ebookId: string;
    tocItems: TocItem[];
    currentPage: number;
    activeItemId: string | null;
    onTocItemClick: (item: TocItem) => void;
    onBookmarkClick: (bookmark: BookmarkItem) => void;
    onHighlightClick: (highlight: Highlight) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
    onHighlightChange?: () => void;
    className?: string;
    theme?: 'light' | 'dark' | 'sepia';
    isMobile?: boolean;
    onClose?: () => void;
}

export function EbookReaderSidebar({
    title,
    ebookId,
    tocItems,
    currentPage,
    activeItemId,
    onTocItemClick,
    onBookmarkClick,
    onHighlightClick,
    onUpdateHighlightNote,
    onHighlightChange,
    className = "",
    theme = "light",
    isMobile = false,
    onClose,
}: EbookReaderSidebarProps) {
    const [activeTab, setActiveTab] = useState("toc");

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

    // 테마에 따른 탭 스타일 설정
    const getTabThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-800 data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-sm';
            case 'sepia':
                return 'bg-amber-100 data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm';
            default:
                return 'bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm';
        }
    };

    // 테마에 따른 항목 스타일 설정
    const getItemThemeStyles = (isActive = false) => {
        switch (theme) {
            case 'dark':
                return isActive
                    ? 'bg-gray-800 border-l-4 border-blue-500'
                    : 'hover:bg-gray-800/70';
            case 'sepia':
                return isActive
                    ? 'bg-amber-100 border-l-4 border-amber-600'
                    : 'hover:bg-amber-100/70';
            default:
                return isActive
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100/70';
        }
    };

    return (
        <div className={`flex flex-col h-full ${getThemeStyles()} ${className}`}>
            <div className={`flex items-center justify-between p-3 border-b ${theme === 'dark' ? 'border-gray-700' : theme === 'sepia' ? 'border-amber-200' : 'border-gray-200'}`}>
                <h2 className={`${isMobile ? 'text-lg' : 'text-base'} font-semibold truncate`}>{title}</h2>
                {isMobile && onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className={`h-9 w-9 ${theme === 'dark' ? 'hover:bg-gray-700' : theme === 'sepia' ? 'hover:bg-amber-200' : 'hover:bg-gray-200'}`}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <Tabs defaultValue="toc" className="flex-1 flex flex-col">
                <TabsList className={`grid grid-cols-3 w-full rounded-none ${getTabThemeStyles()}`}>
                    <TabsTrigger
                        value="toc"
                        onClick={() => setActiveTab("toc")}
                    >
                        목차
                    </TabsTrigger>
                    <TabsTrigger
                        value="bookmarks"
                        onClick={() => setActiveTab("bookmarks")}
                    >
                        북마크
                    </TabsTrigger>
                    <TabsTrigger
                        value="highlights"
                        onClick={() => setActiveTab("highlights")}
                    >
                        하이라이트
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="toc" className="flex-1 overflow-hidden px-4">
                    <TocTab
                        tocItems={tocItems}
                        currentPage={currentPage}
                        activeItemId={activeItemId}
                        onTocItemClick={onTocItemClick}
                        theme={theme}
                    />
                </TabsContent>

                <TabsContent value="bookmarks" className="flex-1 overflow-hidden px-4">
                    <BookmarkTab
                        ebookId={ebookId}
                        currentPage={currentPage}
                        onBookmarkClick={onBookmarkClick}
                        theme={theme}
                    />
                </TabsContent>

                <TabsContent value="highlights" className="flex-1 overflow-hidden px-4">
                    <HighlightTab
                        ebookId={ebookId}
                        currentPage={currentPage}
                        onHighlightClick={onHighlightClick}
                        onUpdateHighlightNote={(highlightId, note) => {
                            onUpdateHighlightNote(highlightId, note);
                            if (onHighlightChange) {
                                onHighlightChange();
                            }
                        }}
                        theme={theme}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 