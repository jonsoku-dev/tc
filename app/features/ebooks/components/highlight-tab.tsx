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
    theme?: 'light' | 'dark' | 'sepia';
}

// 하이라이트 아이템 컴포넌트 (개별 하이라이트 표시)
function HighlightItem({
    highlight,
    currentPage,
    onHighlightClick,
    onUpdateHighlightNote,
    onDeleteHighlight,
    theme = 'light'
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

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNoteText(e.target.value);
    };

    const isCurrent = highlight.pageNumber === currentPage;

    // 테마에 따른 스타일 설정
    const getThemeStyles = () => {
        const baseStyle = {
            backgroundColor: `${highlight.color}20`,
            borderColor: highlight.color
        };

        if (isCurrent) {
            return {
                ...baseStyle,
                borderLeftWidth: '4px'
            };
        }

        return baseStyle;
    };

    // 테마에 따른 노트 영역 스타일
    const getNoteAreaStyle = () => {
        switch (theme) {
            case 'dark':
                return 'border-gray-700 bg-gray-800';
            case 'sepia':
                return 'border-amber-200 bg-amber-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    // 테마에 따른 텍스트 색상
    const getTextColorStyle = () => {
        switch (theme) {
            case 'dark':
                return 'text-gray-400';
            case 'sepia':
                return 'text-amber-700';
            default:
                return 'text-gray-500';
        }
    };

    // 테마에 따른 버튼 스타일
    const getButtonStyle = () => {
        switch (theme) {
            case 'dark':
                return 'hover:bg-gray-700 text-gray-400 hover:text-white';
            case 'sepia':
                return 'hover:bg-amber-200 text-amber-700 hover:text-amber-900';
            default:
                return 'hover:bg-gray-200 text-gray-500 hover:text-gray-900';
        }
    };

    return (
        <div
            className={`group rounded-md transition-all duration-200 cursor-pointer ${isCurrent
                    ? `bg-opacity-20 ${highlight.color === '#ffeb3b' ? 'border-yellow-500' : ''}`
                    : 'hover:bg-opacity-10'
                }`}
            style={getThemeStyles()}
            onClick={() => onHighlightClick(highlight)}
        >
            <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                        <div
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                            style={{ backgroundColor: highlight.color }}
                        />
                        <span className={`text-xs font-medium ${getTextColorStyle()}`}>
                            {format(new Date(highlight.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEditing && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-6 w-6 rounded-full ${getButtonStyle()}`}
                                    onClick={handleStartEditNote}
                                >
                                    <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-6 w-6 rounded-full text-red-500 hover:text-red-600 ${theme === 'dark' ? 'hover:bg-gray-700' : theme === 'sepia' ? 'hover:bg-amber-200' : 'hover:bg-red-50'}`}
                                    onClick={handleDeleteHighlight}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-2">
                    <p className="text-sm leading-relaxed">
                        {highlight.text}
                    </p>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center ${getTextColorStyle()}`}>
                        페이지: {highlight.pageNumber}
                        {isCurrent && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${theme === 'dark'
                                    ? 'bg-blue-900 text-blue-200'
                                    : theme === 'sepia'
                                        ? 'bg-amber-200 text-amber-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                현재 페이지
                            </span>
                        )}
                    </span>
                    {highlight.blockType && (
                        <span className={`text-xs ${getTextColorStyle()}`}>
                            {highlight.blockType}
                        </span>
                    )}
                </div>

                {(highlight.note || isEditing) && (
                    <div className={`mt-3 pt-3 border-t ${getNoteAreaStyle()}`}>
                        {isEditing ? (
                            <div className="space-y-2">
                                <Textarea
                                    value={noteText}
                                    onChange={handleNoteChange}
                                    placeholder="노트를 입력하세요..."
                                    className={`min-h-[80px] text-sm ${theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : theme === 'sepia'
                                                ? 'bg-amber-100 border-amber-200'
                                                : ''
                                        }`}
                                    autoFocus
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancelEditNote}
                                        className={`h-7 text-xs px-2 ${theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                                : theme === 'sepia'
                                                    ? 'bg-amber-100 border-amber-200 hover:bg-amber-200'
                                                    : ''
                                            }`}
                                    >
                                        취소
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveNote}
                                        className="h-7 text-xs px-2"
                                    >
                                        저장
                                    </Button>
                                </div>
                            </div>
                        ) : highlight.note ? (
                            <div className={`p-2 rounded text-sm ${theme === 'dark'
                                    ? 'bg-gray-700'
                                    : theme === 'sepia'
                                        ? 'bg-amber-100'
                                        : 'bg-gray-50'
                                }`}>
                                {highlight.note}
                            </div>
                        ) : null}
                    </div>
                )}
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
    refCallback,
    theme = 'light'
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
    theme?: 'light' | 'dark' | 'sepia';
}) {
    // 테마에 따른 텍스트 색상
    const getTextColorStyle = () => {
        switch (theme) {
            case 'dark':
                return 'text-gray-400';
            case 'sepia':
                return 'text-amber-700';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-3 py-2 px-1">
            {highlights.length === 0 ? (
                <div className={`text-center py-8 ${getTextColorStyle()}`}>
                    하이라이트가 없습니다.
                </div>
            ) : (
                <>
                    {highlights.map((highlight) => (
                        <HighlightItem
                            key={highlight.id}
                            highlight={highlight}
                            currentPage={currentPage}
                            onHighlightClick={onHighlightClick}
                            onUpdateHighlightNote={onUpdateHighlightNote}
                            onDeleteHighlight={onDeleteHighlight}
                            theme={theme}
                        />
                    ))}

                    <div ref={refCallback} className="py-2 text-center">
                        {isFetchingNextPage ? (
                            <div className={`text-sm ${getTextColorStyle()}`}>더 불러오는 중...</div>
                        ) : hasNextPage ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-sm ${getTextColorStyle()}`}
                                onClick={() => fetchNextPage()}
                            >
                                더 보기 <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        ) : highlights.length > 0 ? (
                            <div className={`text-sm ${getTextColorStyle()}`}>모든 하이라이트를 불러왔습니다.</div>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}

interface HighlightTabProps {
    ebookId: string;
    currentPage: number;
    onHighlightClick: (highlight: Highlight) => void;
    onUpdateHighlightNote: (highlightId: string, note: string) => void;
    theme?: 'light' | 'dark' | 'sepia';
}

export function HighlightTab({
    ebookId,
    currentPage,
    onHighlightClick,
    onUpdateHighlightNote: parentUpdateHighlightNote,
    theme = 'light'
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
                    theme={theme}
                />
            </ScrollArea>
        </div>
    );
} 