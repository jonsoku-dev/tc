import { X, ChevronDown } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { useSupabase } from "~/common/hooks/use-supabase";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

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

interface Highlight {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    color: string;
    note?: string;
    createdAt: Date;
    pageNumber: number;
    blockId?: string;
    blockType?: string;
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
    const { supabase } = useSupabase();
    const queryClient = useQueryClient();
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: ["bookmarks", ebookId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data, error, count } = await supabase
                .from("bookmarks")
                .select("*", { count: "exact" })
                .eq("ebook_id", ebookId)
                .order("created_at", { ascending: false })
                .range(pageParam, pageParam + 9);

            if (error) throw error;

            return {
                bookmarks: data.map(item => ({
                    id: item.bookmark_id,
                    position: 0,
                    title: item.title || `페이지 ${item.page_number}`,
                    createdAt: new Date(item.created_at || new Date()),
                    pageNumber: item.page_number
                })),
                nextPage: data.length === 10 ? pageParam + 10 : undefined,
                totalCount: count || 0
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0
    });

    const deleteBookmarkMutation = useMutation({
        mutationFn: async (bookmarkId: string) => {
            const { error } = await supabase
                .from("bookmarks")
                .delete()
                .eq("bookmark_id", bookmarkId);

            if (error) throw error;
            return bookmarkId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookmarks", ebookId] });
        }
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleDeleteBookmark = (bookmarkId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteBookmarkMutation.mutate(bookmarkId);
    };

    if (status === "pending") {
        return <div className="text-center py-4">북마크를 불러오는 중...</div>;
    }

    if (status === "error") {
        return <div className="text-center py-4 text-red-500">북마크를 불러오는 중 오류가 발생했습니다.</div>;
    }

    const bookmarks = data?.pages.flatMap(page => page.bookmarks) || [];

    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-1">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">북마크가 없습니다.</div>
                    ) : (
                        <>
                            {bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.id}
                                    className={`flex items-center justify-between py-2 px-3 rounded cursor-pointer ${bookmark.pageNumber === currentPage
                                        ? "bg-gray-100"
                                        : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => onBookmarkClick(bookmark)}
                                >
                                    <div className="flex items-center">
                                        <div>
                                            <div className="font-medium">{bookmark.title}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(bookmark.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-gray-500 hover:text-red-500"
                                        onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
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

interface HighlightTabProps {
    ebookId: string;
    currentPage: number;
    onHighlightClick: (highlight: Highlight) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
}

function HighlightTab({ ebookId, currentPage, onHighlightClick, onUpdateHighlightNote }: HighlightTabProps) {
    const { supabase } = useSupabase();
    const queryClient = useQueryClient();
    const { ref, inView } = useInView();
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: ["highlights", ebookId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data, error, count } = await supabase
                .from("highlights")
                .select("*", { count: "exact" })
                .eq("ebook_id", ebookId)
                .order("created_at", { ascending: false })
                .range(pageParam, pageParam + 9);

            if (error) throw error;

            return {
                highlights: data.map(item => ({
                    id: item.highlight_id,
                    text: item.text,
                    startOffset: item.start_position,
                    endOffset: item.end_position,
                    color: item.color || "#FFEB3B",
                    note: item.note || undefined,
                    createdAt: new Date(item.created_at || new Date()),
                    pageNumber: item.page_number,
                    blockId: item.block_id || undefined,
                    blockType: item.block_type || undefined
                })),
                nextPage: data.length === 10 ? pageParam + 10 : undefined,
                totalCount: count || 0
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0
    });

    const deleteHighlightMutation = useMutation({
        mutationFn: async (highlightId: string) => {
            const { error } = await supabase
                .from("highlights")
                .delete()
                .eq("highlight_id", highlightId);

            if (error) throw error;
            return highlightId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["highlights", ebookId] });
        }
    });

    const updateHighlightNoteMutation = useMutation({
        mutationFn: async ({ highlightId, note }: { highlightId: string; note: string }) => {
            const { error } = await supabase
                .from("highlights")
                .update({ note })
                .eq("highlight_id", highlightId);

            if (error) throw error;
            return { highlightId, note };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["highlights", ebookId] });
            onUpdateHighlightNote(data.highlightId, data.note);
            setEditingNoteId(null);
        }
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleDeleteHighlight = (highlightId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteHighlightMutation.mutate(highlightId);
    };

    const handleStartEditNote = (highlight: Highlight, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingNoteId(highlight.id);
        setNoteText(highlight.note || "");
    };

    const handleSaveNote = (highlightId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        updateHighlightNoteMutation.mutate({ highlightId, note: noteText });
    };

    const handleCancelEditNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingNoteId(null);
    };

    if (status === "pending") {
        return <div className="text-center py-4">하이라이트를 불러오는 중...</div>;
    }

    if (status === "error") {
        return <div className="text-center py-4 text-red-500">하이라이트를 불러오는 중 오류가 발생했습니다.</div>;
    }

    const highlights = data?.pages.flatMap(page => page.highlights) || [];

    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-1">
                    {highlights.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">하이라이트가 없습니다.</div>
                    ) : (
                        <>
                            {highlights.map((highlight) => (
                                <div
                                    key={highlight.id}
                                    className={`py-2 px-3 rounded cursor-pointer ${highlight.pageNumber === currentPage
                                        ? "bg-gray-100"
                                        : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => onHighlightClick(highlight)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                            <div
                                                className="h-3 w-3 rounded-full mr-2"
                                                style={{ backgroundColor: highlight.color }}
                                            />
                                            <div className="text-xs text-gray-500">
                                                {new Date(highlight.createdAt).toLocaleDateString()}
                                                {highlight.blockType && (
                                                    <span className="ml-2 px-1 py-0.5 bg-gray-200 rounded text-xs">
                                                        {highlight.blockType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-gray-500 hover:text-red-500"
                                            onClick={(e) => handleDeleteHighlight(highlight.id, e)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-sm mb-1">{highlight.text}</div>

                                    {editingNoteId === highlight.id ? (
                                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                            <textarea
                                                className="w-full p-2 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                                rows={3}
                                                placeholder="노트를 입력하세요..."
                                            />
                                            <div className="flex justify-end mt-1 space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={handleCancelEditNote}
                                                >
                                                    취소
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={(e) => handleSaveNote(highlight.id, e)}
                                                >
                                                    저장
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {highlight.note ? (
                                                <div
                                                    className="text-xs bg-gray-50 p-2 rounded relative group"
                                                    onClick={(e) => handleStartEditNote(highlight, e)}
                                                >
                                                    {highlight.note}
                                                    <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-xs text-gray-400">
                                                        클릭하여 편집
                                                    </span>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-xs text-gray-500 mt-1"
                                                    onClick={(e) => handleStartEditNote(highlight, e)}
                                                >
                                                    + 노트 추가
                                                </Button>
                                            )}
                                        </>
                                    )}
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
                                ) : highlights.length > 0 ? (
                                    <div className="text-sm text-gray-500">모든 하이라이트를 불러왔습니다.</div>
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
    return (
        <div className={`w-80 border-r flex flex-col h-full ${className}`}>
            <div className="p-4 border-b flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold truncate">{title}</h2>
                </div>
                <Tabs defaultValue="toc" className="flex flex-col flex-1">
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