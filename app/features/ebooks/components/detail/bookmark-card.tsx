import { Bookmark, Trash } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { EbookCardFrame } from "./ebook-card-frame";

interface BookmarkItem {
    bookmark_id: string;
    user_id: string;
    ebook_id: string;
    page_number: number;
    title?: string;
    created_at: string;
}

interface BookmarkCardProps {
    bookmarks: BookmarkItem[];
    currentUserId: string;
    onBookmarkDelete: (bookmarkId: string) => void;
    onBookmarkClick?: (pageNumber: number) => void;
    className?: string;
}

export function BookmarkCard({
    bookmarks,
    currentUserId,
    onBookmarkDelete,
    onBookmarkClick,
    className = ""
}: BookmarkCardProps) {
    if (bookmarks.length === 0) {
        return (
            <EbookCardFrame title="북마크" icon={Bookmark} className={className}>
                <div className="text-center py-6">
                    <p className="text-gray-500">저장된 북마크가 없습니다.</p>
                </div>
            </EbookCardFrame>
        );
    }

    return (
        <EbookCardFrame title={`북마크 (${bookmarks.length})`} icon={Bookmark} className={className}>
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
                                        {bookmark.title || `${bookmark.page_number}페이지`}
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
        </EbookCardFrame>
    );
} 