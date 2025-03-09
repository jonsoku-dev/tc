import { X } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";

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

interface EbookReaderSidebarProps {
    title: string;
    tocItems: TocItem[];
    bookmarks: BookmarkItem[];
    highlights: Highlight[];
    currentPage: number;
    activeItemId: string | null;
    onTocItemClick: (item: TocItem) => void;
    onBookmarkClick: (bookmark: BookmarkItem) => void;
    onDeleteBookmark: (bookmarkId: string) => void;
    onHighlightClick: (highlight: Highlight) => void;
    onDeleteHighlight: (highlightId: string) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
    className?: string;
}

export function EbookReaderSidebar({
    title,
    tocItems,
    bookmarks,
    highlights,
    currentPage,
    activeItemId,
    onTocItemClick,
    onBookmarkClick,
    onDeleteBookmark,
    onHighlightClick,
    onDeleteHighlight,
    onUpdateHighlightNote,
    className = "",
}: EbookReaderSidebarProps) {
    return (
        <div className={`w-80 border-r flex flex-col h-full ${className}`}>
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold truncate">{title}</h2>
                </div>
                <Tabs defaultValue="toc">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="toc">목차</TabsTrigger>
                        <TabsTrigger value="bookmarks">북마크</TabsTrigger>
                        <TabsTrigger value="highlights">하이라이트</TabsTrigger>
                    </TabsList>
                    <TabsContent value="toc" className="mt-4 h-[calc(100vh-180px)] overflow-auto">
                        <div className="space-y-1">
                            {tocItems.map((item) => (
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
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="bookmarks" className="mt-4 h-[calc(100vh-180px)] overflow-auto">
                        <div className="space-y-2">
                            {bookmarks.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">북마크가 없습니다.</div>
                            ) : (
                                bookmarks.map((bookmark) => (
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteBookmark(bookmark.id);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="highlights" className="mt-4 h-[calc(100vh-180px)] overflow-auto">
                        <div className="space-y-2">
                            {highlights.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">하이라이트가 없습니다.</div>
                            ) : (
                                highlights.map((highlight) => (
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteHighlight(highlight.id);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-sm mb-1">{highlight.text}</div>
                                        {highlight.note && (
                                            <div className="text-xs bg-gray-50 p-2 rounded">
                                                {highlight.note}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 