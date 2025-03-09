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
    // Supabase 훅을 사용하여 북마크 데이터 가져오기
    const { bookmarks, status, hasNextPage, isFetchingNextPage, fetchNextPage, ref } = useBookmarks(ebookId);
    const createBookmarkMutation = useCreateBookmark(ebookId);
    const deleteBookmarkMutation = useDeleteBookmark(ebookId);

    const handleDeleteBookmark = (bookmarkId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("북마크를 삭제하시겠습니까?")) {
            deleteBookmarkMutation.mutate(bookmarkId);
        }
    };

    const handleAddBookmark = () => {
        const title = prompt("북마크 제목을 입력하세요:");
        if (title) {
            createBookmarkMutation.mutate({
                title,
                pageNumber: currentPage,
                position: 0, // 페이지 내 위치 (스크롤 위치 등)
            });
        }
    };

    if (status === "pending") {
        return <div className="text-center py-4">북마크를 불러오는 중...</div>;
    }

    if (status === "error") {
        return <div className="text-center py-4 text-red-500">북마크를 불러오는 중 오류가 발생했습니다.</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-2 flex justify-between items-center">
                <div className="text-sm font-medium">북마크 ({bookmarks.length})</div>
                <Button variant="outline" size="sm" onClick={handleAddBookmark}>
                    <Bookmark className="h-4 w-4 mr-1" />
                    <span>현재 페이지 북마크</span>
                </Button>
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
                                    onClick={() => onBookmarkClick(bookmark)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Bookmark className="h-4 w-4 mr-2 text-primary" />
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
    className?: string;
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
    className = "",
}: EbookReaderSidebarProps) {
    const [activeTab, setActiveTab] = useState("toc");

    return (
        <div className={`w-80 border-r flex flex-col h-full ${className}`}>
            <div className="p-4 border-b flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold truncate">{title}</h2>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="toc">목차</TabsTrigger>
                        <TabsTrigger value="bookmarks">북마크</TabsTrigger>
                        <TabsTrigger value="highlights">하이라이트</TabsTrigger>
                    </TabsList>
                    <TabsContent value="toc" className="mt-4 flex-1 overflow-hidden">
                        <TocTab
                            tocItems={tocItems}
                            currentPage={currentPage}
                            activeItemId={activeItemId}
                            onTocItemClick={onTocItemClick}
                        />
                    </TabsContent>
                    <TabsContent value="bookmarks" className="mt-4 flex-1 overflow-hidden">
                        <BookmarkTab
                            ebookId={ebookId}
                            currentPage={currentPage}
                            onBookmarkClick={onBookmarkClick}
                        />
                    </TabsContent>
                    <TabsContent value="highlights" className="mt-4 flex-1 overflow-hidden">
                        <HighlightTab
                            ebookId={ebookId}
                            currentPage={currentPage}
                            onHighlightClick={onHighlightClick}
                            onUpdateHighlightNote={onUpdateHighlightNote}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 