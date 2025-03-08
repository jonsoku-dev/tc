import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "~/common/components/ui/button";
import { Plus, ChevronUp, ChevronDown, Trash, GripVertical } from "lucide-react";
import { cn } from "~/common/lib/utils";
import { Input } from "~/common/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/common/components/ui/select";
import { BlockEditor } from "./blocks";
import type { PageItem as PageItemInterface, PageEditorProps } from "./types";
import type { Block, BlockType } from "../types";

// @dnd-kit 라이브러리 import
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 정렬 가능한 페이지 아이템 컴포넌트
function SortablePage({
    page,
    index,
    expandedPageId,
    expandedBlockId,
    editable,
    togglePageExpand,
    updatePageTitle,
    removePage,
    addBlock,
    updateBlock,
    removeBlock,
    toggleBlockExpand,
    onBlocksReorder,
}: {
    page: PageItemInterface;
    index: number;
    expandedPageId: string | null;
    expandedBlockId: string | null;
    editable: boolean;
    togglePageExpand: (id: string) => void;
    updatePageTitle: (id: string, title: string) => void;
    removePage: (id: string) => void;
    addBlock: (pageId: string, blockType: BlockType) => void;
    updateBlock: (pageId: string, blockId: string, updatedBlock: Partial<Block>) => void;
    removeBlock: (pageId: string, blockId: string) => void;
    toggleBlockExpand: (id: string) => void;
    onBlocksReorder: (pageId: string, blocks: Block[]) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border rounded-lg overflow-hidden transition-all duration-200"
        >
            <div className={cn(
                "p-3 flex items-center justify-between",
                isDragging ? "bg-blue-50" : "bg-gray-50"
            )}>
                <div className="flex items-center gap-2">
                    {editable && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded transition-colors"
                        >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                    )}
                    {expandedPageId === page.id ? (
                        <Input
                            value={page.title}
                            onChange={(e) => updatePageTitle(page.id, e.target.value)}
                            className="w-64"
                        />
                    ) : (
                        <div className="font-medium">{page.title}</div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePageExpand(page.id)}
                    >
                        {expandedPageId === page.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                    {editable && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePage(page.id)}
                        >
                            <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                    )}
                </div>
            </div>
            {expandedPageId === page.id && (
                <div className="p-4 space-y-4">
                    {page.blocks.length > 0 && (
                        <BlockList
                            pageId={page.id}
                            blocks={page.blocks}
                            editable={editable}
                            expandedBlockId={expandedBlockId}
                            toggleBlockExpand={toggleBlockExpand}
                            updateBlock={updateBlock}
                            removeBlock={removeBlock}
                            onBlocksReorder={onBlocksReorder}
                        />
                    )}

                    {/* 블록 추가 버튼 */}
                    {editable && (
                        <div className="pt-2">
                            <Select onValueChange={(value) => addBlock(page.id, value as BlockType)}>
                                <SelectTrigger className="bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center">
                                        <Plus className="h-4 w-4 mr-2 text-blue-500" />
                                        <SelectValue placeholder="블록 추가" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paragraph">문단</SelectItem>
                                    <SelectItem value="heading">제목</SelectItem>
                                    <SelectItem value="image">이미지</SelectItem>
                                    <SelectItem value="code">코드</SelectItem>
                                    <SelectItem value="table">테이블</SelectItem>
                                    <SelectItem value="video">비디오</SelectItem>
                                    <SelectItem value="audio">오디오</SelectItem>
                                    <SelectItem value="markdown">마크다운</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// 정렬 가능한 블록 아이템 컴포넌트
function SortableBlock({
    block,
    pageId,
    editable,
    expandedBlockId,
    toggleBlockExpand,
    updateBlock,
    removeBlock,
}: {
    block: Block;
    pageId: string;
    editable: boolean;
    expandedBlockId: string | null;
    toggleBlockExpand: (id: string) => void;
    updateBlock: (pageId: string, blockId: string, updatedBlock: Partial<Block>) => void;
    removeBlock: (pageId: string, blockId: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "border rounded p-3 transition-all duration-200",
                isDragging ? "shadow-lg border-blue-400 ring-2 ring-blue-200 bg-blue-50" : ""
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {editable && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded transition-colors"
                        >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                    )}
                    <div className="text-sm text-gray-500">
                        {block.type}
                    </div>
                </div>
                {editable && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlock(pageId, block.id)}
                    >
                        <Trash className="h-3 w-3 text-red-500" />
                    </Button>
                )}
            </div>
            <BlockEditor
                pageId={pageId}
                block={block}
                isExpanded={expandedBlockId === block.id}
                toggleBlockExpand={toggleBlockExpand}
                updateBlock={updateBlock}
            />
        </div>
    );
}

// 블록 목록 컴포넌트
function BlockList({
    pageId,
    blocks,
    editable,
    expandedBlockId,
    toggleBlockExpand,
    updateBlock,
    removeBlock,
    onBlocksReorder,
}: {
    pageId: string;
    blocks: Block[];
    editable: boolean;
    expandedBlockId: string | null;
    toggleBlockExpand: (id: string) => void;
    updateBlock: (pageId: string, blockId: string, updatedBlock: Partial<Block>) => void;
    removeBlock: (pageId: string, blockId: string) => void;
    onBlocksReorder: (pageId: string, blocks: Block[]) => void;
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex(block => block.id === active.id);
            const newIndex = blocks.findIndex(block => block.id === over.id);

            const updatedBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
                ...block,
                position: index + 1,
            }));

            // 상위 컴포넌트의 콜백 호출
            onBlocksReorder(pageId, updatedBlocks);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={blocks.map(block => block.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {blocks.map((block) => (
                        <SortableBlock
                            key={block.id}
                            block={block}
                            pageId={pageId}
                            editable={editable}
                            expandedBlockId={expandedBlockId}
                            toggleBlockExpand={toggleBlockExpand}
                            updateBlock={updateBlock}
                            removeBlock={removeBlock}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

export function PageEditor({
    pages,
    editable = false,
    onPagesChange,
    className = "",
}: PageEditorProps) {
    const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
    const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    // 센서 설정
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 드래그 시작 처리
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    // 드래그 종료 처리
    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragId(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = pages.findIndex(page => page.id === active.id);
            const newIndex = pages.findIndex(page => page.id === over.id);

            const updatedPages = arrayMove(pages, oldIndex, newIndex).map((page, index) => ({
                ...page,
                position: index + 1,
            }));

            onPagesChange?.(updatedPages);
        }
    };

    // 블록 순서 변경 처리
    const handleBlocksReorder = (pageId: string, updatedBlocks: Block[]) => {
        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const updatedPages = [...pages];
        updatedPages[pageIndex] = {
            ...updatedPages[pageIndex],
            blocks: updatedBlocks,
        };

        onPagesChange?.(updatedPages);
    };

    // 새 페이지 추가
    const addPage = () => {
        if (!editable) return;

        const newPage: PageItemInterface = {
            id: uuidv4(),
            title: `새 페이지 ${pages.length + 1}`,
            blocks: [],
            position: pages.length + 1,
        };

        onPagesChange?.([...pages, newPage]);
        setExpandedPageId(newPage.id);
    };

    // 페이지에 새 블록 추가
    const addBlock = (pageId: string, blockType: BlockType) => {
        if (!editable) return;

        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const page = pages[pageIndex];

        // 기본 블록 생성
        const baseBlock = {
            id: uuidv4(),
            type: blockType,
            position: page.blocks.length + 1,
        };

        // 블록 타입에 따른 추가 속성 설정
        let newBlock: Block;

        switch (blockType) {
            case "paragraph":
                newBlock = {
                    ...baseBlock,
                    type: "paragraph",
                    content: "",
                };
                break;
            case "heading":
                newBlock = {
                    ...baseBlock,
                    type: "heading",
                    content: "",
                    level: 2,
                };
                break;
            case "image":
                newBlock = {
                    ...baseBlock,
                    type: "image",
                    url: "",
                    alt: "",
                };
                break;
            case "code":
                newBlock = {
                    ...baseBlock,
                    type: "code",
                    code: "",
                    language: "javascript",
                };
                break;
            case "table":
                newBlock = {
                    ...baseBlock,
                    type: "table",
                    headers: ["제목 1", "제목 2"],
                    rows: [["내용 1", "내용 2"]],
                };
                break;
            case "video":
                newBlock = {
                    ...baseBlock,
                    type: "video",
                    url: "",
                };
                break;
            case "audio":
                newBlock = {
                    ...baseBlock,
                    type: "audio",
                    url: "",
                };
                break;
            case "markdown":
                newBlock = {
                    ...baseBlock,
                    type: "markdown",
                    content: "",
                };
                break;
            default:
                return;
        }

        const updatedPages = [...pages];
        updatedPages[pageIndex] = {
            ...page,
            blocks: [...page.blocks, newBlock],
        };

        onPagesChange?.(updatedPages);
        setExpandedBlockId(newBlock.id);
    };

    // 페이지 제목 업데이트
    const updatePageTitle = (id: string, title: string) => {
        if (!editable) return;

        const updatedPages = pages.map(page => {
            if (page.id === id) {
                return { ...page, title };
            }
            return page;
        });

        onPagesChange?.(updatedPages);
    };

    // 블록 업데이트
    const updateBlock = (pageId: string, blockId: string, updatedBlock: Partial<Block>) => {
        if (!editable) return;

        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const page = pages[pageIndex];
        const blockIndex = page.blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;

        const currentBlock = page.blocks[blockIndex];

        // 타입에 따라 적절한 업데이트 로직 적용
        let newBlock: Block;

        switch (currentBlock.type) {
            case "paragraph":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "paragraph" as const
                } as Block;
                break;
            case "heading":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "heading" as const
                } as Block;
                break;
            case "image":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "image" as const
                } as Block;
                break;
            case "code":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "code" as const
                } as Block;
                break;
            case "table":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "table" as const
                } as Block;
                break;
            case "video":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "video" as const
                } as Block;
                break;
            case "audio":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "audio" as const
                } as Block;
                break;
            case "markdown":
                newBlock = {
                    ...currentBlock,
                    ...updatedBlock,
                    type: "markdown" as const
                } as Block;
                break;
            default:
                newBlock = currentBlock;
        }

        const updatedBlocks = [...page.blocks];
        updatedBlocks[blockIndex] = newBlock;

        const updatedPages = [...pages];
        updatedPages[pageIndex] = {
            ...page,
            blocks: updatedBlocks,
        };

        onPagesChange?.(updatedPages);
    };

    // 페이지 삭제
    const removePage = (id: string) => {
        if (!editable) return;

        const updatedPages = pages
            .filter(page => page.id !== id)
            .map((page, index) => ({
                ...page,
                position: index + 1,
            }));

        onPagesChange?.(updatedPages);
    };

    // 블록 삭제
    const removeBlock = (pageId: string, blockId: string) => {
        if (!editable) return;

        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const page = pages[pageIndex];
        const updatedBlocks = page.blocks
            .filter(block => block.id !== blockId)
            .map((block, index) => ({
                ...block,
                position: index + 1,
            }));

        const updatedPages = [...pages];
        updatedPages[pageIndex] = {
            ...page,
            blocks: updatedBlocks,
        };

        onPagesChange?.(updatedPages);
    };

    // 페이지 확장/축소 토글
    const togglePageExpand = (id: string) => {
        setExpandedPageId(expandedPageId === id ? null : id);
    };

    // 블록 확장/축소 토글
    const toggleBlockExpand = (id: string) => {
        setExpandedBlockId(expandedBlockId === id ? null : id);
    };

    // 드래그 앤 드롭 기능이 비활성화된 경우 간단한 렌더링
    if (!editable) {
        return (
            <div className={`page-editor ${className}`}>
                <div className="space-y-4 p-2 rounded-lg">
                    {pages.map((page) => (
                        <div key={page.id} className="border rounded-lg overflow-hidden">
                            <div className="p-3 flex items-center justify-between bg-gray-50">
                                <div className="font-medium">{page.title}</div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePageExpand(page.id)}
                                    type="button"
                                >
                                    {expandedPageId === page.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
                            </div>
                            {expandedPageId === page.id && (
                                <div className="p-4 space-y-4">
                                    {page.blocks.map((block) => (
                                        <div key={block.id} className="border rounded p-3">
                                            <div className="text-sm text-gray-500 mb-2">
                                                {block.type}
                                            </div>
                                            <BlockEditor
                                                pageId={page.id}
                                                block={block}
                                                isExpanded={expandedBlockId === block.id}
                                                toggleBlockExpand={toggleBlockExpand}
                                                updateBlock={updateBlock}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`page-editor ${className}`}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={pages.map(page => page.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4 p-2 rounded-lg">
                        {pages.map((page, index) => (
                            <SortablePage
                                key={page.id}
                                page={page}
                                index={index}
                                expandedPageId={expandedPageId}
                                expandedBlockId={expandedBlockId}
                                editable={editable}
                                togglePageExpand={togglePageExpand}
                                updatePageTitle={updatePageTitle}
                                removePage={removePage}
                                addBlock={addBlock}
                                updateBlock={updateBlock}
                                removeBlock={removeBlock}
                                toggleBlockExpand={toggleBlockExpand}
                                onBlocksReorder={handleBlocksReorder}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* 페이지 추가 버튼 */}
            <Button
                type="button"
                variant="outline"
                className="mt-4 w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                onClick={addPage}
            >
                <Plus className="h-4 w-4 mr-2 text-blue-500" />
                새 페이지 추가
            </Button>
        </div>
    );
}

export type { PageItem as PageItemInterface, PageEditorProps } from "./types";
export { BlockEditor } from "./blocks"; 