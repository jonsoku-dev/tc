import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Bookmark, Trash } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface BookmarkItem {
    bookmark_id: string;
    user_id: string;
    ebook_id: string;
    page_number: number;
    created_at: string;
}

interface BookmarkListProps {
    bookmarks: BookmarkItem[];
    currentUserId?: string;
    onBookmarkClick?: (pageNumber: number) => void;
    onBookmarkDelete?: (bookmarkId: string) => void;
    className?: string;
}

export function BookmarkList({
    bookmarks,
    currentUserId,
    onBookmarkClick,
    onBookmarkDelete,
    className = "",
}: BookmarkListProps) {
    if (bookmarks.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>북마크</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-gray-500">저장된 북마크가 없습니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>북마크 ({bookmarks.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {bookmarks.map((bookmark) => {
                        const isOwner = currentUserId === bookmark.user_id;

                        return (
                            <div
                                key={bookmark.bookmark_id}
                                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                            >
                                <div
                                    className="flex items-center space-x-3 cursor-pointer"
                                    onClick={() => onBookmarkClick?.(bookmark.page_number)}
                                >
                                    <Bookmark className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="font-medium">
                                            {bookmark.page_number}페이지
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(bookmark.created_at), "yyyy년 MM월 dd일", {
                                                locale: ko,
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {isOwner && onBookmarkDelete && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onBookmarkDelete(bookmark.bookmark_id)}
                                        className="text-red-500"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
} 