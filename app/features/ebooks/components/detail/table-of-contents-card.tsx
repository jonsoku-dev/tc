import { useState, useEffect } from "react";
import { List, Plus, Trash, ChevronDown, ChevronRight, Edit, Check, X } from "lucide-react";
import { EbookCardFrame } from "./ebook-card-frame";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { cn } from "~/common/lib/utils";
import { Badge } from "~/common/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { toast } from "sonner";

// 목차 아이템 타입 정의
interface TocItem {
    id: string;
    title: string;
    level: number;
}

interface TableOfContentsCardProps {
    items: string[];
    editable?: boolean;
    onItemsChange?: (items: string[]) => void;
    className?: string;
}

export function TableOfContentsCard({
    items,
    editable = false,
    onItemsChange,
    className = ""
}: TableOfContentsCardProps) {
    // 문자열 배열을 TocItem 객체 배열로 변환하는 함수
    const parseItems = (stringItems: string[]): TocItem[] => {
        // 간단한 구현: 들여쓰기 수준만 감지하고 평면적인 구조로 반환
        return stringItems.map((item, index) => {
            // 들여쓰기 수준 감지 (예: "  제목" -> 레벨 2)
            let level = 1;
            let title = item;

            // 들여쓰기 감지 로직 (공백 2개당 1레벨 증가)
            const match = item.match(/^(\s+)/);
            if (match) {
                level = Math.floor(match[1].length / 2) + 1;
                title = item.trim();
            }

            return {
                id: `item-${index}`,
                title,
                level,
            };
        });
    };

    // 목차 아이템을 문자열 배열로 변환하는 함수
    const stringifyItems = (items: TocItem[]): string[] => {
        return items.map(item => {
            // 들여쓰기 추가
            const indent = '  '.repeat(item.level - 1);
            return `${indent}${item.title}`;
        });
    };

    const [tocItems, setTocItems] = useState<TocItem[]>(() => parseItems(items));
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState<TocItem[]>([]);

    // 검색 결과 필터링
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredItems(tocItems);
            return;
        }

        // 평면적인 구조에서 검색
        const filtered = tocItems.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredItems(filtered);
    }, [searchTerm, tocItems]);

    // 항목 수정 시작
    const startEditing = (item: TocItem) => {
        setEditingItemId(item.id);
        setEditValue(item.title);
    };

    // 항목 수정 완료
    const finishEditing = () => {
        if (!editingItemId) return;

        const updatedItems = tocItems.map(item =>
            item.id === editingItemId ? { ...item, title: editValue } : item
        );

        setTocItems(updatedItems);
        updateParentItems(updatedItems);
        setEditingItemId(null);
        toast.success("항목이 수정되었습니다.");
    };

    // 항목 수정 취소
    const cancelEditing = () => {
        setEditingItemId(null);
    };

    // 항목 삭제
    const removeItem = (id: string) => {
        const updatedItems = tocItems.filter(item => item.id !== id);
        setTocItems(updatedItems);
        updateParentItems(updatedItems);
        toast.success("항목이 삭제되었습니다.");
    };

    // 항목 레벨 변경
    const changeItemLevel = (id: string, newLevel: number) => {
        const updatedItems = tocItems.map(item =>
            item.id === id ? { ...item, level: newLevel } : item
        );

        setTocItems(updatedItems);
        updateParentItems(updatedItems);
    };

    // 부모 컴포넌트에 변경사항 전달
    const updateParentItems = (items: TocItem[]) => {
        if (onItemsChange) {
            onItemsChange(stringifyItems(items));
        }
    };

    // 목차 항목 렌더링
    const renderTocItem = (item: TocItem, index: number, isEditable: boolean) => {
        return (
            <div
                key={item.id}
                className={cn(
                    "flex items-center py-1 hover:bg-gray-50 rounded",
                    searchTerm && item.title.toLowerCase().includes(searchTerm.toLowerCase()) && "bg-yellow-50"
                )}
                style={{ paddingLeft: `${(item.level - 1) * 1.5}rem` }}
            >
                {/* 들여쓰기 레벨에 따른 시각적 표시 */}
                {item.level > 1 && (
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    </div>
                )}

                {editingItemId === item.id ? (
                    <div className="flex items-center flex-1">
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={finishEditing}
                            className="h-7 w-7"
                        >
                            <Check className="h-3 w-3 text-green-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                            className="h-7 w-7"
                        >
                            <X className="h-3 w-3 text-red-500" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between flex-1">
                        <span className={cn(
                            "text-sm",
                            item.level > 1 && "text-gray-600",
                            item.level > 2 && "text-gray-500 text-xs"
                        )}>
                            {item.title}
                        </span>

                        {isEditable && (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Select
                                    value={item.level.toString()}
                                    onValueChange={(value) => changeItemLevel(item.id, parseInt(value))}
                                >
                                    <SelectTrigger className="h-6 w-16">
                                        <SelectValue placeholder="레벨" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">레벨 1</SelectItem>
                                        <SelectItem value="2">레벨 2</SelectItem>
                                        <SelectItem value="3">레벨 3</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditing(item)}
                                    className="h-7 w-7"
                                >
                                    <Edit className="h-3 w-3 text-blue-500" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(item.id)}
                                    className="h-7 w-7"
                                >
                                    <Trash className="h-3 w-3 text-red-500" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <EbookCardFrame title="목차" icon={List} className={className}>
            <div className="space-y-4">
                {/* 검색 및 컨트롤 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {/* 여기에 필요한 경우 다른 컨트롤 추가 */}
                    </div>

                    <div className="flex items-center space-x-2">
                        {isSearching ? (
                            <Input
                                placeholder="검색어 입력..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-7 w-40 text-xs"
                                autoFocus
                            />
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsSearching(true)}
                                className="text-xs h-7"
                            >
                                검색
                            </Button>
                        )}

                        {isSearching && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setIsSearching(false);
                                    setSearchTerm("");
                                }}
                                className="h-7 w-7"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}

                        {editable && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    const newItem: TocItem = {
                                        id: `item-${Date.now()}`,
                                        title: "새 항목",
                                        level: 1,
                                    };
                                    const updatedItems = [...tocItems, newItem];
                                    setTocItems(updatedItems);
                                    updateParentItems(updatedItems);
                                    toast.success("새 항목이 추가되었습니다.");
                                }}
                                className="text-xs h-7"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                추가
                            </Button>
                        )}
                    </div>
                </div>

                {/* 목차 내용 */}
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                    {(searchTerm ? filteredItems : tocItems).length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            {searchTerm ? "검색 결과가 없습니다." : "목차가 없습니다."}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {(searchTerm ? filteredItems : tocItems).map((item, index) =>
                                renderTocItem(item, index, editable)
                            )}
                        </div>
                    )}
                </div>

                {/* 통계 정보 */}
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>총 {items.length}개 항목</span>
                    {searchTerm && (
                        <Badge variant="outline" className="text-xs">
                            검색 결과: {filteredItems.length}개
                        </Badge>
                    )}
                </div>
            </div>
        </EbookCardFrame>
    );
} 