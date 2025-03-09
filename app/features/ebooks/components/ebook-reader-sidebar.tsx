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
}

function TocTab({ tocItems, currentPage, activeItemId, onTocItemClick }: TocTabProps) {
    return (
        <ScrollArea className="h-full">
            <div className="space-y-1 p-1 pb-4">
                {tocItems.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">목차가 없습니다.</div>
                ) : (
                    tocItems.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center py-2 px-3 rounded cursor-pointer ${activeItemId === item.id
                                ? "bg-primary/10 text-primary"
                                : item.pageNumber === currentPage
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-100"
                                }`}
                            style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
                            onClick={() => onTocItemClick(item)}
                        >
                            <span>{item.title}</span>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
    );
}

interface BookmarkTabProps {
    ebookId: string;
    currentPage: number;
    onBookmarkClick: (bookmark: BookmarkItem) => void;
}

function BookmarkTab({ ebookId, currentPage, onBookmarkClick }: BookmarkTabProps) {
    const [error, setError] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);

    // 쿼리 클라이언트 및 북마크 관련 훅
    const queryClient = useQueryClient();
    const { bookmarks, status, hasNextPage, isFetchingNextPage, fetchNextPage, ref } = useBookmarks(ebookId);
    const deleteBookmarkMutation = useDeleteBookmark(ebookId);

    // 북마크 삭제 핸들러
    const handleDeleteBookmark = (bookmarkId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBookmarkToDelete(bookmarkId);
        setShowDeleteDialog(true);
    };

    // 북마크 삭제 확인
    const confirmDeleteBookmark = () => {
        if (!bookmarkToDelete) return;

        console.log("북마크 삭제 요청:", bookmarkToDelete);
        deleteBookmarkMutation.mutate(bookmarkToDelete, {
            onSuccess: () => {
                console.log("북마크가 성공적으로 삭제되었습니다.");
                // 북마크 쿼리 무효화
                queryClient.invalidateQueries({
                    queryKey: EBOOK_QUERY_KEYS.BOOKMARKS(ebookId)
                });
                setShowDeleteDialog(false);
                setBookmarkToDelete(null);
            },
            onError: (error: any) => {
                console.error("북마크 삭제 중 오류 발생:", error);
                setError("북마크 삭제 중 오류가 발생했습니다.");
                setShowDeleteDialog(false);
                setBookmarkToDelete(null);
            }
        });
    };

    // 북마크 클릭 핸들러 - 페이지 이동
    const handleBookmarkClick = (bookmark: BookmarkItem) => {
        console.log("북마크 클릭:", bookmark);
        onBookmarkClick(bookmark);
    };

    if (status === "pending") {
        return <div className="text-center py-4">북마크를 불러오는 중...</div>;
    }

    if (status === "error" || error) {
        return (
            <div className="text-center py-4 text-red-500">
                {error || "북마크를 불러오는 중 오류가 발생했습니다."}
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setError(null)}
                >
                    다시 시도
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* 북마크 삭제 다이얼로그 */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
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

            <div className="mb-2 flex justify-between items-center">
                <div className="text-sm font-medium">북마크 ({bookmarks.length})</div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-1">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            북마크가 없습니다.
                        </div>
                    ) : (
                        <>
                            {bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.id}
                                    className={`py-2 px-3 rounded cursor-pointer ${bookmark.pageNumber === currentPage
                                        ? "bg-gray-100"
                                        : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => handleBookmarkClick(bookmark)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Bookmark
                                                className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500"
                                            />
                                            <div className="text-sm font-medium truncate">
                                                {bookmark.title}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500"
                                            onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        페이지: {bookmark.pageNumber}
                                    </div>
                                </div>
                            ))}

                            <div ref={ref} className="py-2 text-center mb-4">
                                {isFetchingNextPage ? (
                                    <div className="text-sm text-gray-500">더 불러오는 중...</div>
                                ) : hasNextPage ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-sm text-gray-500"
                                        onClick={() => fetchNextPage()}
                                    >
                                        더 보기 <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                ) : bookmarks.length > 0 ? (
                                    <div className="text-sm text-gray-500">모든 북마크를 불러왔습니다.</div>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
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

    return (
        <div className={`w-80 h-full border-r overflow-hidden flex flex-col ${getThemeStyles()} ${className}`}>
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold truncate">{title}</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 mx-4 mt-2">
                    <TabsTrigger value="toc">목차</TabsTrigger>
                    <TabsTrigger value="bookmarks">북마크</TabsTrigger>
                    <TabsTrigger value="highlights">하이라이트</TabsTrigger>
                </TabsList>

                <TabsContent value="toc" className="flex-1 overflow-hidden">
                    <TocTab
                        tocItems={tocItems}
                        currentPage={currentPage}
                        activeItemId={activeItemId}
                        onTocItemClick={onTocItemClick}
                    />
                </TabsContent>

                <TabsContent value="bookmarks" className="flex-1 overflow-hidden">
                    <BookmarkTab
                        ebookId={ebookId}
                        currentPage={currentPage}
                        onBookmarkClick={onBookmarkClick}
                    />
                </TabsContent>

                <TabsContent value="highlights" className="flex-1 overflow-hidden">
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
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 