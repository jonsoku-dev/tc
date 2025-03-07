import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Highlighter, Trash, Edit, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Textarea } from "~/common/components/ui/textarea";

interface HighlightItem {
    highlight_id: string;
    user_id: string;
    ebook_id: string;
    start_position: number;
    end_position: number;
    color: string;
    note?: string;
    created_at: string;
    updated_at: string;
    text?: string; // 하이라이트된 텍스트
}

interface HighlightListProps {
    highlights: HighlightItem[];
    currentUserId?: string;
    onHighlightClick?: (startPosition: number, endPosition: number) => void;
    onHighlightDelete?: (highlightId: string) => void;
    onNoteUpdate?: (highlightId: string, note: string) => void;
    className?: string;
}

export function HighlightList({
    highlights,
    currentUserId,
    onHighlightClick,
    onHighlightDelete,
    onNoteUpdate,
    className = "",
}: HighlightListProps) {
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState("");

    const startEditingNote = (highlight: HighlightItem) => {
        setEditingNoteId(highlight.highlight_id);
        setNoteText(highlight.note || "");
    };

    const saveNote = (highlightId: string) => {
        onNoteUpdate?.(highlightId, noteText);
        setEditingNoteId(null);
    };

    const cancelEditingNote = () => {
        setEditingNoteId(null);
    };

    if (highlights.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>하이라이트</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-gray-500">저장된 하이라이트가 없습니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>하이라이트 ({highlights.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {highlights.map((highlight) => {
                        const isOwner = currentUserId === highlight.user_id;
                        const isEditing = editingNoteId === highlight.highlight_id;

                        return (
                            <div
                                key={highlight.highlight_id}
                                className="border rounded-md overflow-hidden"
                            >
                                <div
                                    className="p-3 cursor-pointer"
                                    style={{ backgroundColor: `${highlight.color}20` }}
                                    onClick={() => onHighlightClick?.(highlight.start_position, highlight.end_position)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: highlight.color }}
                                            />
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(highlight.created_at), "yyyy년 MM월 dd일", {
                                                    locale: ko,
                                                })}
                                            </span>
                                        </div>

                                        {isOwner && (
                                            <div className="flex space-x-1">
                                                {!isEditing && highlight.note && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEditingNote(highlight);
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                {!isEditing && !highlight.note && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEditingNote(highlight);
                                                        }}
                                                    >
                                                        <MessageSquare className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onHighlightDelete?.(highlight.highlight_id);
                                                    }}
                                                >
                                                    <Trash className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Highlighter className="h-4 w-4 text-gray-500 mt-1" />
                                        <div>
                                            <p className="text-sm">
                                                {highlight.text || "하이라이트된 텍스트"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {highlight.note && !isEditing && (
                                    <div className="p-3 bg-gray-50 border-t">
                                        <p className="text-sm text-gray-700">{highlight.note}</p>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="p-3 bg-gray-50 border-t">
                                        <Textarea
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="메모를 입력하세요..."
                                            rows={3}
                                            className="mb-2"
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={cancelEditingNote}
                                            >
                                                취소
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => saveNote(highlight.highlight_id)}
                                            >
                                                저장
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
} 