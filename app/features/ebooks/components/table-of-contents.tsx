import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash, ChevronDown, ChevronRight } from "lucide-react";

interface TocItem {
    id: string;
    title: string;
    level: number;
    children?: TocItem[];
}

interface TableOfContentsProps {
    items: string[];
    editable?: boolean;
    onItemsChange?: (items: string[]) => void;
    className?: string;
}

export function TableOfContents({
    items,
    editable = false,
    onItemsChange,
    className = "",
}: TableOfContentsProps) {
    const [tocItems, setTocItems] = useState<TocItem[]>(() => {
        // 문자열 배열을 TocItem 객체 배열로 변환
        return items.map((item, index) => ({
            id: `item-${index}`,
            title: item,
            level: 1,
        }));
    });

    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpand = (itemId: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(tocItems);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        setTocItems(reorderedItems);
        updateParentItems(reorderedItems);
    };

    const addItem = () => {
        const newItem: TocItem = {
            id: `item-${Date.now()}`,
            title: "새 항목",
            level: 1,
        };
        const updatedItems = [...tocItems, newItem];
        setTocItems(updatedItems);
        updateParentItems(updatedItems);
    };

    const updateItem = (id: string, title: string) => {
        const updatedItems = tocItems.map((item) =>
            item.id === id ? { ...item, title } : item
        );
        setTocItems(updatedItems);
        updateParentItems(updatedItems);
    };

    const removeItem = (id: string) => {
        const updatedItems = tocItems.filter((item) => item.id !== id);
        setTocItems(updatedItems);
        updateParentItems(updatedItems);
    };

    const updateParentItems = (items: TocItem[]) => {
        if (onItemsChange) {
            // TocItem 객체 배열을 문자열 배열로 변환하여 부모에게 전달
            onItemsChange(items.map((item) => item.title));
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>목차</CardTitle>
                    {editable && (
                        <Button size="sm" onClick={addItem}>
                            <Plus className="h-4 w-4 mr-1" />
                            항목 추가
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {tocItems.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        목차가 없습니다.
                    </div>
                ) : editable ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="toc-items">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    {tocItems.map((item, index) => (
                                        <Draggable
                                            key={item.id}
                                            draggableId={item.id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="flex items-center space-x-2 p-2 border rounded-md bg-white"
                                                >
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="cursor-grab"
                                                    >
                                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) =>
                                                            updateItem(item.id, e.target.value)
                                                        }
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-red-500"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                ) : (
                    <div className="space-y-1">
                        {tocItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center py-1 hover:bg-gray-50 rounded cursor-pointer"
                                style={{ paddingLeft: `${(item.level - 1) * 1.5}rem` }}
                            >
                                <div className="flex items-center">
                                    {item.children?.length ? (
                                        <button
                                            onClick={() => toggleExpand(item.id)}
                                            className="mr-1 p-1"
                                        >
                                            {expandedItems.has(item.id) ? (
                                                <ChevronDown className="h-3 w-3 text-gray-500" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-gray-500" />
                                            )}
                                        </button>
                                    ) : (
                                        <span className="w-5" />
                                    )}
                                    <span>{item.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 