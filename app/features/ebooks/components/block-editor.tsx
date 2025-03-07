import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { Textarea } from "~/common/components/ui/textarea";
import { GripVertical, Plus, Trash, Edit, ChevronDown, ChevronUp, Image, Code, Video, Music, Table, Heading, Type } from "lucide-react";
import { MarkdownEditor } from "./markdown-editor";
import type { Block, BlockType } from "./types";

// 블록 타입 옵션
const BLOCK_TYPES = [
    { value: "paragraph", label: "문단", icon: <Type className="h-4 w-4" /> },
    { value: "heading", label: "제목", icon: <Heading className="h-4 w-4" /> },
    { value: "image", label: "이미지", icon: <Image className="h-4 w-4" /> },
    { value: "code", label: "코드", icon: <Code className="h-4 w-4" /> },
    { value: "video", label: "비디오", icon: <Video className="h-4 w-4" /> },
    { value: "audio", label: "오디오", icon: <Music className="h-4 w-4" /> },
    { value: "table", label: "테이블", icon: <Table className="h-4 w-4" /> },
    { value: "markdown", label: "마크다운", icon: <Type className="h-4 w-4" /> },
];

// 코드 언어 옵션
const CODE_LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
    { value: "plaintext", label: "Plain Text" },
];

interface BlockEditorProps {
    blocks: Block[];
    onBlocksChange: (blocks: Block[]) => void;
    className?: string;
}

export function BlockEditor({ blocks, onBlocksChange, className = "" }: BlockEditorProps) {
    const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

    // 블록 드래그 앤 드롭 처리
    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // 위치 업데이트
        const updatedBlocks = items.map((block, index) => ({
            ...block,
            position: index + 1,
        }));

        onBlocksChange(updatedBlocks);
    };

    // 새 블록 추가
    const addBlock = (type: string) => {
        const newBlock = createNewBlock(type, blocks.length + 1);
        const updatedBlocks = [...blocks, newBlock];
        onBlocksChange(updatedBlocks);

        // 새 블록 자동 확장
        setExpandedBlocks({
            ...expandedBlocks,
            [newBlock.id]: true,
        });
    };

    // 블록 타입에 따른 새 블록 생성
    const createNewBlock = (type: string, position: number): Block => {
        const id = uuidv4();

        switch (type) {
            case "paragraph":
                return {
                    id,
                    type: "paragraph" as const,
                    position,
                    content: "",
                    style: {
                        fontSize: "16px",
                        lineHeight: "1.6",
                    },
                };
            case "heading":
                return {
                    id,
                    type: "heading" as const,
                    position,
                    content: "",
                    level: 2,
                };
            case "image":
                return {
                    id,
                    type: "image" as const,
                    position,
                    url: "",
                    alt: "",
                    caption: "",
                    width: 0,
                    height: 0,
                };
            case "code":
                return {
                    id,
                    type: "code" as const,
                    position,
                    language: "javascript",
                    code: "",
                    caption: "",
                };
            case "table":
                return {
                    id,
                    type: "table" as const,
                    position,
                    headers: ["제목 1", "제목 2", "제목 3"],
                    rows: [
                        ["내용 1-1", "내용 1-2", "내용 1-3"],
                        ["내용 2-1", "내용 2-2", "내용 2-3"],
                    ],
                    caption: "",
                };
            case "video":
                return {
                    id,
                    type: "video" as const,
                    position,
                    url: "",
                    caption: "",
                    controls: true,
                    autoplay: false,
                };
            case "audio":
                return {
                    id,
                    type: "audio" as const,
                    position,
                    url: "",
                    caption: "",
                    controls: true,
                    autoplay: false,
                };
            case "markdown":
                return {
                    id,
                    type: "markdown" as const,
                    position,
                    content: "",
                };
            default:
                return {
                    id,
                    type: "paragraph" as const,
                    position,
                    content: "",
                };
        }
    };

    // 블록 업데이트
    const updateBlock = (id: string, updates: Partial<Block>) => {
        const blockIndex = blocks.findIndex(block => block.id === id);
        if (blockIndex === -1) return;

        const currentBlock = blocks[blockIndex];

        // 타입에 따라 적절한 업데이트 로직 적용
        let newBlock: Block;

        switch (currentBlock.type) {
            case "paragraph":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "paragraph" as const
                } as Block;
                break;
            case "heading":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "heading" as const
                } as Block;
                break;
            case "image":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "image" as const
                } as Block;
                break;
            case "code":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "code" as const
                } as Block;
                break;
            case "table":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "table" as const
                } as Block;
                break;
            case "video":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "video" as const
                } as Block;
                break;
            case "audio":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "audio" as const
                } as Block;
                break;
            case "markdown":
                newBlock = {
                    ...currentBlock,
                    ...updates,
                    type: "markdown" as const
                } as Block;
                break;
            default:
                newBlock = currentBlock;
        }

        const updatedBlocks = [...blocks];
        updatedBlocks[blockIndex] = newBlock;
        onBlocksChange(updatedBlocks);
    };

    // 블록 삭제
    const removeBlock = (id: string) => {
        const updatedBlocks = blocks
            .filter((block) => block.id !== id)
            .map((block, index) => ({
                ...block,
                position: index + 1,
            }));
        onBlocksChange(updatedBlocks);
    };

    // 블록 확장/축소 토글
    const toggleExpand = (id: string) => {
        setExpandedBlocks({
            ...expandedBlocks,
            [id]: !expandedBlocks[id],
        });
    };

    // 블록 타입에 따른 에디터 렌더링
    const renderBlockEditor = (block: Block) => {
        const isExpanded = expandedBlocks[block.id] !== false;

        switch (block.type) {
            case "paragraph":
                return (
                    <div className="space-y-2">
                        <Textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            placeholder="문단 내용을 입력하세요"
                            rows={4}
                        />
                    </div>
                );
            case "heading":
                return (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Select
                                value={String(block.level)}
                                onValueChange={(value) => updateBlock(block.id, { level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 })}
                            >
                                <SelectTrigger className="w-24">
                                    <SelectValue placeholder="레벨" />
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
                            <Input
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                placeholder="제목을 입력하세요"
                                className="flex-1"
                            />
                        </div>
                    </div>
                );
            case "image":
                return (
                    <div className="space-y-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`image-url-${block.id}`}>이미지 URL</Label>
                            <Input
                                id={`image-url-${block.id}`}
                                value={block.url}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                placeholder="이미지 URL을 입력하세요"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`image-alt-${block.id}`}>대체 텍스트</Label>
                            <Input
                                id={`image-alt-${block.id}`}
                                value={block.alt || ""}
                                onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                                placeholder="대체 텍스트를 입력하세요"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`image-caption-${block.id}`}>캡션</Label>
                            <Input
                                id={`image-caption-${block.id}`}
                                value={block.caption || ""}
                                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="캡션을 입력하세요"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor={`image-width-${block.id}`}>너비</Label>
                                <Input
                                    id={`image-width-${block.id}`}
                                    type="number"
                                    value={block.width || ""}
                                    onChange={(e) => updateBlock(block.id, { width: Number(e.target.value) || undefined })}
                                    placeholder="너비"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`image-height-${block.id}`}>높이</Label>
                                <Input
                                    id={`image-height-${block.id}`}
                                    type="number"
                                    value={block.height || ""}
                                    onChange={(e) => updateBlock(block.id, { height: Number(e.target.value) || undefined })}
                                    placeholder="높이"
                                />
                            </div>
                        </div>
                        {block.url && (
                            <div className="mt-2">
                                <img
                                    src={block.url}
                                    alt={block.alt || ""}
                                    className="max-w-full h-auto border rounded"
                                />
                                {block.caption && (
                                    <p className="text-sm text-gray-500 mt-1 text-center">{block.caption}</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            case "code":
                return (
                    <div className="space-y-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`code-language-${block.id}`}>언어</Label>
                            <Select
                                value={block.language || "plaintext"}
                                onValueChange={(value) => updateBlock(block.id, { language: value })}
                            >
                                <SelectTrigger id={`code-language-${block.id}`}>
                                    <SelectValue placeholder="언어 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CODE_LANGUAGES.map((lang) => (
                                        <SelectItem key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`code-content-${block.id}`}>코드</Label>
                            <Textarea
                                id={`code-content-${block.id}`}
                                value={block.code}
                                onChange={(e) => updateBlock(block.id, { code: e.target.value })}
                                placeholder="코드를 입력하세요"
                                rows={8}
                                className="font-mono"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`code-caption-${block.id}`}>캡션</Label>
                            <Input
                                id={`code-caption-${block.id}`}
                                value={block.caption || ""}
                                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="캡션을 입력하세요"
                            />
                        </div>
                    </div>
                );
            case "video":
                return (
                    <div className="space-y-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`video-url-${block.id}`}>비디오 URL</Label>
                            <Input
                                id={`video-url-${block.id}`}
                                value={block.url}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                placeholder="비디오 URL을 입력하세요"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`video-caption-${block.id}`}>캡션</Label>
                            <Input
                                id={`video-caption-${block.id}`}
                                value={block.caption || ""}
                                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="캡션을 입력하세요"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id={`video-controls-${block.id}`}
                                type="checkbox"
                                checked={block.controls !== false}
                                onChange={(e) => updateBlock(block.id, { controls: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`video-controls-${block.id}`}>컨트롤 표시</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id={`video-autoplay-${block.id}`}
                                type="checkbox"
                                checked={block.autoplay || false}
                                onChange={(e) => updateBlock(block.id, { autoplay: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`video-autoplay-${block.id}`}>자동 재생</Label>
                        </div>
                    </div>
                );
            case "audio":
                return (
                    <div className="space-y-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`audio-url-${block.id}`}>오디오 URL</Label>
                            <Input
                                id={`audio-url-${block.id}`}
                                value={block.url}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                placeholder="오디오 URL을 입력하세요"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`audio-caption-${block.id}`}>캡션</Label>
                            <Input
                                id={`audio-caption-${block.id}`}
                                value={block.caption || ""}
                                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="캡션을 입력하세요"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id={`audio-controls-${block.id}`}
                                type="checkbox"
                                checked={block.controls !== false}
                                onChange={(e) => updateBlock(block.id, { controls: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`audio-controls-${block.id}`}>컨트롤 표시</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id={`audio-autoplay-${block.id}`}
                                type="checkbox"
                                checked={block.autoplay || false}
                                onChange={(e) => updateBlock(block.id, { autoplay: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor={`audio-autoplay-${block.id}`}>자동 재생</Label>
                        </div>
                    </div>
                );
            case "table":
                return (
                    <div className="space-y-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`table-caption-${block.id}`}>캡션</Label>
                            <Input
                                id={`table-caption-${block.id}`}
                                value={block.caption || ""}
                                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="테이블 캡션을 입력하세요"
                            />
                        </div>
                        <div className="overflow-x-auto border rounded">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        {block.headers.map((header, index) => (
                                            <th key={index} className="border p-2 bg-gray-100">
                                                <Input
                                                    value={header}
                                                    onChange={(e) => {
                                                        const newHeaders = [...block.headers];
                                                        newHeaders[index] = e.target.value;
                                                        updateBlock(block.id, { headers: newHeaders });
                                                    }}
                                                    placeholder={`제목 ${index + 1}`}
                                                    className="min-w-[100px]"
                                                />
                                            </th>
                                        ))}
                                        <th className="border p-2 bg-gray-100 w-10">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newHeaders = [...block.headers, `제목 ${block.headers.length + 1}`];
                                                    const newRows = block.rows.map(row => [...row, ""]);
                                                    updateBlock(block.id, { headers: newHeaders, rows: newRows });
                                                }}
                                                className="w-full"
                                            >
                                                +
                                            </Button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {block.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className="border p-2">
                                                    <Input
                                                        value={cell}
                                                        onChange={(e) => {
                                                            const newRows = [...block.rows];
                                                            newRows[rowIndex][cellIndex] = e.target.value;
                                                            updateBlock(block.id, { rows: newRows });
                                                        }}
                                                        placeholder={`내용 ${rowIndex * block.headers.length + cellIndex + 1}`}
                                                        className="min-w-[100px]"
                                                    />
                                                </td>
                                            ))}
                                            <td className="border p-2 w-10">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newRows = block.rows.filter((_, i) => i !== rowIndex);
                                                        updateBlock(block.id, { rows: newRows });
                                                    }}
                                                    className="w-full"
                                                >
                                                    -
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={block.headers.length + 1} className="border p-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newRow = Array(block.headers.length).fill("");
                                                    const newRows = [...block.rows, newRow];
                                                    updateBlock(block.id, { rows: newRows });
                                                }}
                                                className="w-full"
                                            >
                                                행 추가
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "markdown":
                return (
                    <div className="space-y-2">
                        <Textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            placeholder="마크다운 내용을 입력하세요"
                            rows={4}
                        />
                    </div>
                );
            default:
                return <div>지원되지 않는 블록 타입입니다.</div>;
        }
    };

    return (
        <div className={`block-editor ${className}`}>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="blocks">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                        >
                            {blocks.map((block, index) => (
                                <Draggable key={block.id} draggableId={block.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="border rounded-lg overflow-hidden"
                                        >
                                            <div className="bg-gray-50 p-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div {...provided.dragHandleProps}>
                                                        <GripVertical className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {BLOCK_TYPES.find(t => t.value === block.type)?.icon}
                                                        <span className="text-sm font-medium">
                                                            {BLOCK_TYPES.find(t => t.value === block.type)?.label || block.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleExpand(block.id)}
                                                    >
                                                        {expandedBlocks[block.id] !== false ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeBlock(block.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {expandedBlocks[block.id] !== false && (
                                                <div className="p-4 bg-white">
                                                    {renderBlockEditor(block)}
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

            <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                    {BLOCK_TYPES.map((type) => (
                        <Button
                            key={type.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock(type.value)}
                            className="flex items-center gap-1"
                        >
                            {type.icon}
                            <span>{type.label}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
} 