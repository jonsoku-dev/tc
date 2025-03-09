import { useState, useCallback } from "react";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Trash2, Edit3, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Highlight } from "./types";
import { useHighlights, useDeleteHighlight, useUpdateHighlightNote } from "../hooks/use-highlight-api";
import { EBOOK_QUERY_KEYS } from "../constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";

interface HighlightItemProps {
    highlight: Highlight;
    currentPage: number;
    onHighlightClick: (highlight: Highlight) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
    onDeleteHighlight: (highlightId: string) => void;
}

// 하이라이트 아이템 컴포넌트 (개별 하이라이트 표시)
function HighlightItem({
    highlight,
    currentPage,
    onHighlightClick,
    onUpdateHighlightNote,
    onDeleteHighlight
}: HighlightItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [noteText, setNoteText] = useState(highlight.note || "");

    const handleStartEditNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setNoteText(highlight.note || "");
    };

    const handleSaveNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdateHighlightNote(highlight.id, noteText);
        setIsEditing(false);
    };

    const handleCancelEditNote = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
        setNoteText(highlight.note || "");
    };

    const handleDeleteHighlight = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteHighlight(highlight.id);
    };

    return (
        <div
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
                        {format(new Date(highlight.createdAt), "yyyy.MM.dd", { locale: ko })}
                        {highlight.blockType && (
                            <span className="ml-1">({highlight.blockType})</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleStartEditNote}
                    >
                        <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={handleDeleteHighlight}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="text-sm mb-1 line-clamp-3">{highlight.text}</div>

            {isEditing ? (
                <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="노트를 입력하세요"
                        className="min-h-[80px] text-sm"
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditNote}
                        >
                            취소
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveNote}
                        >
                            저장
                        </Button>
                    </div>
                </div>
            ) : highlight.note ? (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                    {highlight.note}
                </div>
            ) : null}

            <div className="text-xs text-gray-400 mt-1">
                페이지: {highlight.pageNumber}
            </div>
        </div>
    );
}

// 하이라이트 목록 컴포넌트
function HighlightList({
    highlights,
    currentPage,
    onHighlightClick,
    onUpdateHighlightNote,
    onDeleteHighlight,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refCallback
}: {
    highlights: Highlight[];
    currentPage: number;
    onHighlightClick: (highlight: Highlight) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
    onDeleteHighlight: (highlightId: string) => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    refCallback: (node?: Element | null) => void;
}) {
    if (highlights.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                {currentPage}페이지에 하이라이트가 없습니다.
            </div>
        );
    }

    return (
        <>
            {highlights.map((highlight) => (
                <HighlightItem
                    key={highlight.id}
                    highlight={highlight}
                    currentPage={currentPage}
                    onHighlightClick={onHighlightClick}
                    onUpdateHighlightNote={onUpdateHighlightNote}
                    onDeleteHighlight={onDeleteHighlight}
                />
            ))}

            <div ref={refCallback} className="py-2 text-center mb-4">
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
    );
}

interface HighlightTabProps {
    ebookId: string;
    currentPage: number;
    onHighlightClick: (highlight: Highlight) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
}

export function HighlightTab({
    ebookId,
    currentPage,
    onHighlightClick,
    onUpdateHighlightNote: parentUpdateHighlightNote,
}: HighlightTabProps) {
    // API 훅 사용
    const { highlights, status, hasNextPage, isFetchingNextPage, fetchNextPage, ref } = useHighlights(ebookId, currentPage);
    const deleteHighlightMutation = useDeleteHighlight(ebookId);
    const updateHighlightNoteMutation = useUpdateHighlightNote(ebookId);
    const queryClient = useQueryClient();

    // 하이라이트 삭제 핸들러
    const handleDeleteHighlight = useCallback((highlightId: string) => {
        if (window.confirm("하이라이트를 삭제하시겠습니까?")) {
            deleteHighlightMutation.mutate(highlightId, {
                onSuccess: (data) => {
                    alert("하이라이트가 삭제되었습니다.");

                    // 하이라이트 삭제 후 페이지 렌더러에 반영되도록 쿼리 무효화
                    queryClient.invalidateQueries({
                        queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
                    });

                    queryClient.invalidateQueries({
                        queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, currentPage)
                    });

                    // 하이라이트 변경 이벤트 발생
                    window.dispatchEvent(new CustomEvent('highlight-change', {
                        detail: { type: 'delete', highlightId }
                    }));
                },
                onError: (error) => {
                    alert("하이라이트 삭제 중 오류가 발생했습니다.");
                    console.error("하이라이트 삭제 오류:", error);
                }
            });
        }
    }, [deleteHighlightMutation, ebookId, currentPage, queryClient]);

    // 하이라이트 노트 업데이트 핸들러
    const handleUpdateHighlightNote = useCallback((highlightId: string, note: string) => {
        updateHighlightNoteMutation.mutate({ highlightId, note }, {
            onSuccess: (updatedHighlight) => {
                // 부모 컴포넌트에 알림
                parentUpdateHighlightNote(highlightId, note);

                // 하이라이트 노트 업데이트 후 페이지 렌더러에 반영되도록 쿼리 무효화
                queryClient.invalidateQueries({
                    queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS(ebookId)
                });

                queryClient.invalidateQueries({
                    queryKey: EBOOK_QUERY_KEYS.HIGHLIGHTS_BY_PAGE(ebookId, currentPage)
                });

                // 하이라이트 변경 이벤트 발생
                window.dispatchEvent(new CustomEvent('highlight-change', {
                    detail: { type: 'update', highlight: updatedHighlight }
                }));
            },
            onError: (error) => {
                alert("노트 업데이트 중 오류가 발생했습니다.");
                console.error("노트 업데이트 오류:", error);
            }
        });
    }, [updateHighlightNoteMutation, parentUpdateHighlightNote, ebookId, currentPage, queryClient]);

    if (status === "pending") {
        return <div className="text-center py-4">하이라이트를 불러오는 중...</div>;
    }

    if (status === "error") {
        return <div className="text-center py-4 text-red-500">하이라이트를 불러오는 중 오류가 발생했습니다.</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-2 flex justify-between items-center">
                <div className="text-sm font-medium">
                    현재 페이지 하이라이트 ({highlights.length})
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2 p-1">
                    <HighlightList
                        highlights={highlights}
                        currentPage={currentPage}
                        onHighlightClick={onHighlightClick}
                        onUpdateHighlightNote={handleUpdateHighlightNote}
                        onDeleteHighlight={handleDeleteHighlight}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        refCallback={ref}
                    />
                </div>
            </ScrollArea>
        </div>
    );
} 