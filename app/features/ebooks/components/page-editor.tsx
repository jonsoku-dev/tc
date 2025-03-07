import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { GripVertical, Plus, Trash, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { PAGE_CONTENT_TYPE } from "../constants";
import { MarkdownEditor } from "./markdown-editor";
import type { Block, BlockType } from "./types";

export interface PageItem {
    id: string;
    title: string;
    blocks: Block[];
    position: number;
}

interface PageEditorProps {
    pages: PageItem[];
    editable?: boolean;
    onPagesChange?: (pages: PageItem[]) => void;
    className?: string;
}

export function PageEditor({
    pages,
    editable = false,
    onPagesChange,
    className = "",
}: PageEditorProps) {
    const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
    const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

    // 페이지 드래그 앤 드롭 처리
    const handlePageDragEnd = (result: any) => {
        if (!result.destination) return;

        const reorderedPages = Array.from(pages);
        const [removed] = reorderedPages.splice(result.source.index, 1);
        reorderedPages.splice(result.destination.index, 0, removed);

        // 위치 업데이트
        const updatedPages = reorderedPages.map((page, index) => ({
            ...page,
            position: index + 1,
        }));

        onPagesChange?.(updatedPages);
    };

    // 블록 드래그 앤 드롭 처리
    const handleBlockDragEnd = (result: any, pageId: string) => {
        if (!result.destination) return;

        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;

        const page = pages[pageIndex];
        const reorderedBlocks = Array.from(page.blocks);
        const [removed] = reorderedBlocks.splice(result.source.index, 1);
        reorderedBlocks.splice(result.destination.index, 0, removed);

        // 위치 업데이트
        const updatedBlocks = reorderedBlocks.map((block, index) => ({
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

    // 새 페이지 추가
    const addPage = () => {
        if (!editable) return;

        const newPage: PageItem = {
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

        const updatedBlocks = [...page.blocks];
        updatedBlocks[blockIndex] = {
            ...updatedBlocks[blockIndex],
            ...updatedBlock,
        };

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

    // 블록 에디터 렌더링
    const renderBlockEditor = (pageId: string, block: Block) => {
        const isExpanded = expandedBlockId === block.id;

        switch (block.type) {
            case "paragraph":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">문단</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBlockExpand(block.id)}
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                        </div>
                        {isExpanded && (
                            <div className="space-y-2">
                                <textarea
                                    className="w-full min-h-[100px] p-2 border rounded"
                                    value={block.content}
                                    onChange={(e) => updateBlock(pageId, block.id, { content: e.target.value })}
                                    placeholder="문단 내용을 입력하세요"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Select
                                        value={block.style?.textAlign || "left"}
                                        onValueChange={(value) => updateBlock(pageId, block.id, {
                                            style: { ...block.style, textAlign: value as any }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="정렬" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">왼쪽</SelectItem>
                                            <SelectItem value="center">가운데</SelectItem>
                                            <SelectItem value="right">오른쪽</SelectItem>
                                            <SelectItem value="justify">양쪽</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={block.style?.fontWeight || "normal"}
                                        onValueChange={(value) => updateBlock(pageId, block.id, {
                                            style: { ...block.style, fontWeight: value as any }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="글꼴 두께" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">보통</SelectItem>
                                            <SelectItem value="bold">굵게</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "heading":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">제목</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBlockExpand(block.id)}
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                        </div>
                        {isExpanded && (
                            <div className="space-y-2">
                                <Input
                                    value={block.content}
                                    onChange={(e) => updateBlock(pageId, block.id, { content: e.target.value })}
                                    placeholder="제목을 입력하세요"
                                />
                                <Select
                                    value={block.level.toString()}
                                    onValueChange={(value) => updateBlock(pageId, block.id, { level: parseInt(value) as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="제목 레벨" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">H1</SelectItem>
                                        <SelectItem value="2">H2</SelectItem>
                                        <SelectItem value="3">H3</SelectItem>
                                        <SelectItem value="4">H4</SelectItem>
                                        <SelectItem value="5">H5</SelectItem>
                                        <SelectItem value="6">H6</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                );
            case "image":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">이미지</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBlockExpand(block.id)}
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                        </div>
                        {isExpanded && (
                            <div className="space-y-2">
                                <Input
                                    value={block.url}
                                    onChange={(e) => updateBlock(pageId, block.id, { url: e.target.value })}
                                    placeholder="이미지 URL"
                                />
                                <Input
                                    value={block.alt || ""}
                                    onChange={(e) => updateBlock(pageId, block.id, { alt: e.target.value })}
                                    placeholder="대체 텍스트"
                                />
                                <Input
                                    value={block.caption || ""}
                                    onChange={(e) => updateBlock(pageId, block.id, { caption: e.target.value })}
                                    placeholder="이미지 설명"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        value={block.width || ""}
                                        onChange={(e) => updateBlock(pageId, block.id, { width: e.target.value ? parseInt(e.target.value) : undefined })}
                                        placeholder="너비 (px)"
                                    />
                                    <Input
                                        type="number"
                                        value={block.height || ""}
                                        onChange={(e) => updateBlock(pageId, block.id, { height: e.target.value ? parseInt(e.target.value) : undefined })}
                                        placeholder="높이 (px)"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "code":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">코드</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBlockExpand(block.id)}
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                        </div>
                        {isExpanded && (
                            <div className="space-y-2">
                                <Select
                                    value={block.language || "javascript"}
                                    onValueChange={(value) => updateBlock(pageId, block.id, { language: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="언어 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="typescript">TypeScript</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="csharp">C#</SelectItem>
                                        <SelectItem value="cpp">C++</SelectItem>
                                        <SelectItem value="php">PHP</SelectItem>
                                        <SelectItem value="ruby">Ruby</SelectItem>
                                        <SelectItem value="go">Go</SelectItem>
                                        <SelectItem value="rust">Rust</SelectItem>
                                        <SelectItem value="swift">Swift</SelectItem>
                                        <SelectItem value="kotlin">Kotlin</SelectItem>
                                        <SelectItem value="html">HTML</SelectItem>
                                        <SelectItem value="css">CSS</SelectItem>
                                        <SelectItem value="sql">SQL</SelectItem>
                                        <SelectItem value="bash">Bash</SelectItem>
                                        <SelectItem value="json">JSON</SelectItem>
                                        <SelectItem value="xml">XML</SelectItem>
                                        <SelectItem value="yaml">YAML</SelectItem>
                                        <SelectItem value="markdown">Markdown</SelectItem>
                                    </SelectContent>
                                </Select>
                                <textarea
                                    className="w-full min-h-[150px] p-2 border rounded font-mono text-sm"
                                    value={block.code}
                                    onChange={(e) => updateBlock(pageId, block.id, { code: e.target.value })}
                                    placeholder="코드를 입력하세요"
                                />
                                <Input
                                    value={block.caption || ""}
                                    onChange={(e) => updateBlock(pageId, block.id, { caption: e.target.value })}
                                    placeholder="코드 설명"
                                />
                            </div>
                        )}
                    </div>
                );
            case "markdown":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">마크다운</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBlockExpand(block.id)}
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                        </div>
                        {isExpanded && (
                            <div className="space-y-2">
                                <MarkdownEditor
                                    value={block.content}
                                    onChange={(value) => updateBlock(pageId, block.id, { content: value })}
                                    minHeight={200}
                                />
                            </div>
                        )}
                    </div>
                );
            // 다른 블록 타입에 대한 에디터도 추가 가능
            default:
                return <div>지원되지 않는 블록 타입입니다.</div>;
        }
    };

    return (
        <div className={`page-editor ${className}`}>
            <DragDropContext onDragEnd={handlePageDragEnd}>
                <Droppable droppableId="pages">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {pages.map((page, index) => (
                                <Draggable
                                    key={page.id}
                                    draggableId={page.id}
                                    index={index}
                                    isDragDisabled={!editable}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="border rounded-lg overflow-hidden"
                                        >
                                            <div className="bg-gray-50 p-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {editable && (
                                                        <div {...provided.dragHandleProps}>
                                                            <GripVertical className="h-5 w-5 text-gray-400" />
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
                                                    {editable && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => togglePageExpand(page.id)}
                                                            >
                                                                {expandedPageId === page.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removePage(page.id)}
                                                            >
                                                                <Trash className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {expandedPageId === page.id && (
                                                <div className="p-4 space-y-4">
                                                    {/* 블록 목록 */}
                                                    <DragDropContext onDragEnd={(result) => handleBlockDragEnd(result, page.id)}>
                                                        <Droppable droppableId={`blocks-${page.id}`}>
                                                            {(provided) => (
                                                                <div
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    className="space-y-3"
                                                                >
                                                                    {page.blocks.map((block, blockIndex) => (
                                                                        <Draggable
                                                                            key={block.id}
                                                                            draggableId={block.id}
                                                                            index={blockIndex}
                                                                            isDragDisabled={!editable}
                                                                        >
                                                                            {(provided) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    className="border rounded p-3"
                                                                                >
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <div className="flex items-center gap-2">
                                                                                            {editable && (
                                                                                                <div {...provided.dragHandleProps}>
                                                                                                    <GripVertical className="h-4 w-4 text-gray-400" />
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
                                                                                    {renderBlockEditor(page.id, block)}
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </DragDropContext>

                                                    {/* 블록 추가 버튼 */}
                                                    {editable && (
                                                        <div className="pt-2">
                                                            <Select onValueChange={(value) => addBlock(page.id, value as BlockType)}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="블록 추가" />
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
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* 페이지 추가 버튼 */}
            {editable && (
                <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={addPage}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    새 페이지 추가
                </Button>
            )}
        </div>
    );
} 