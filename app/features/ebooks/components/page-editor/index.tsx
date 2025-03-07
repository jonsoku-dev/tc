import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "~/common/components/ui/button";
import { Plus, ChevronUp, ChevronDown, Trash, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "~/common/lib/utils";
import { Input } from "~/common/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/common/components/ui/select";
import { BlockEditor } from "./blocks";
import type { PageItem as PageItemInterface, PageEditorProps } from "./types";
import type { Block, BlockType } from "../types";

export function PageEditor({
    pages,
    editable = false,
    onPagesChange,
    className = "",
}: PageEditorProps) {
    const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
    const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

    // 페이지 위로 이동
    const movePageUp = (index: number) => {
        if (index === 0) return;

        const updatedPages = [...pages];
        const temp = updatedPages[index];
        updatedPages[index] = updatedPages[index - 1];
        updatedPages[index - 1] = temp;

        // 위치 업데이트
        const reorderedPages = updatedPages.map((page, idx) => ({
            ...page,
            position: idx + 1,
        }));

        onPagesChange?.(reorderedPages);
    };

    // 페이지 아래로 이동
    const movePageDown = (index: number) => {
        if (index === pages.length - 1) return;

        const updatedPages = [...pages];
        const temp = updatedPages[index];
        updatedPages[index] = updatedPages[index + 1];
        updatedPages[index + 1] = temp;

        // 위치 업데이트
        const reorderedPages = updatedPages.map((page, idx) => ({
            ...page,
            position: idx + 1,
        }));

        onPagesChange?.(reorderedPages);
    };

    // 블록 위로 이동
    const moveBlockUp = (pageId: string, blockIndex: number) => {
        if (blockIndex === 0) return;

        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const page = pages[pageIndex];
        const updatedBlocks = [...page.blocks];
        const temp = updatedBlocks[blockIndex];
        updatedBlocks[blockIndex] = updatedBlocks[blockIndex - 1];
        updatedBlocks[blockIndex - 1] = temp;

        // 위치 업데이트
        const reorderedBlocks = updatedBlocks.map((block, idx) => ({
            ...block,
            position: idx + 1,
        }));

        const updatedPages = [...pages];
        updatedPages[pageIndex] = {
            ...page,
            blocks: reorderedBlocks,
        };

        onPagesChange?.(updatedPages);
    };

    // 블록 아래로 이동
    const moveBlockDown = (pageId: string, blockIndex: number) => {
        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const page = pages[pageIndex];
        if (blockIndex === page.blocks.length - 1) return;

        const updatedBlocks = [...page.blocks];
        const temp = updatedBlocks[blockIndex];
        updatedBlocks[blockIndex] = updatedBlocks[blockIndex + 1];
        updatedBlocks[blockIndex + 1] = temp;

        // 위치 업데이트
        const reorderedBlocks = updatedBlocks.map((block, idx) => ({
            ...block,
            position: idx + 1,
        }));

        const updatedPages = [...pages];
        updatedPages[pageIndex] = {
            ...page,
            blocks: reorderedBlocks,
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

    return (
        <div className={`page-editor ${className}`}>
            <div className="space-y-4 p-2 rounded-lg">
                {pages.map((page, index) => (
                    <div key={page.id} className="border rounded-lg overflow-hidden">
                        <div className="p-3 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2">
                                {editable && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => movePageUp(index)}
                                            disabled={index === 0}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => movePageDown(index)}
                                            disabled={index === pages.length - 1}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
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
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePageExpand(page.id)}
                                >
                                    {expandedPageId === page.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </Button>
                                {editable && (
                                    <Button
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
                                <div className="space-y-3">
                                    {page.blocks.map((block, blockIndex) => (
                                        <div key={block.id} className="border rounded p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {editable && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => moveBlockUp(page.id, blockIndex)}
                                                                disabled={blockIndex === 0}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <ArrowUp className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => moveBlockDown(page.id, blockIndex)}
                                                                disabled={blockIndex === page.blocks.length - 1}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <ArrowDown className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-500">
                                                        {block.type}
                                                    </div>
                                                </div>
                                                {editable && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeBlock(page.id, block.id)}
                                                    >
                                                        <Trash className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                )}
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
                ))}
            </div>

            {/* 페이지 추가 버튼 */}
            {editable && (
                <Button
                    variant="outline"
                    className="mt-4 w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    onClick={addPage}
                >
                    <Plus className="h-4 w-4 mr-2 text-blue-500" />
                    새 페이지 추가
                </Button>
            )}
        </div>
    );
}

export type { PageItem as PageItemInterface, PageEditorProps } from "./types";
export { BlockEditor } from "./blocks"; 