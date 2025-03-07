import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { PAGE_CONTENT_TYPE } from "../constants";
import { MarkdownEditor } from "./markdown-editor";

export interface PageItem {
    id: string;
    title: string;
    content_type: string;
    content: any;
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

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const reorderedPages = Array.from(pages);
        const [removed] = reorderedPages.splice(result.source.index, 1);
        reorderedPages.splice(result.destination.index, 0, removed);

        // 위치 업데이트
        const updatedPages = reorderedPages.map((page, index) => ({
            ...page,
            position: index + 1,
        }));

        if (onPagesChange) {
            onPagesChange(updatedPages);
        }
    };

    const addPage = () => {
        const newPage: PageItem = {
            id: `page-${Date.now()}`,
            title: "새 페이지",
            content_type: "text",
            content: { content: "" },
            position: pages.length + 1,
        };

        if (onPagesChange) {
            onPagesChange([...pages, newPage]);
        }
    };

    const updatePageTitle = (id: string, title: string) => {
        const updatedPages = pages.map((page) =>
            page.id === id ? { ...page, title } : page
        );

        if (onPagesChange) {
            onPagesChange(updatedPages);
        }
    };

    const updatePageContentType = (id: string, content_type: string) => {
        const updatedPages = pages.map((page) => {
            if (page.id === id) {
                // 콘텐츠 타입에 따라 기본 콘텐츠 구조 설정
                let defaultContent = {};

                switch (content_type) {
                    case "text":
                        defaultContent = { content: page.content?.content || "" };
                        break;
                    case "image":
                        defaultContent = { url: "", alt: "", caption: "" };
                        break;
                    case "code":
                        defaultContent = { language: "javascript", code: "", caption: "" };
                        break;
                    case "table":
                        defaultContent = { headers: [], rows: [], caption: "" };
                        break;
                    case "video":
                        defaultContent = { url: "", caption: "", controls: true };
                        break;
                    case "audio":
                        defaultContent = { url: "", caption: "", controls: true };
                        break;
                    case "mixed":
                        defaultContent = { blocks: [] };
                        break;
                    default:
                        defaultContent = { content: "" };
                }

                return {
                    ...page,
                    content_type,
                    content: defaultContent
                };
            }
            return page;
        });

        if (onPagesChange) {
            onPagesChange(updatedPages);
        }
    };

    const updatePageContent = (id: string, content: any) => {
        const updatedPages = pages.map((page) =>
            page.id === id ? { ...page, content } : page
        );

        if (onPagesChange) {
            onPagesChange(updatedPages);
        }
    };

    const removePage = (id: string) => {
        const filteredPages = pages.filter((page) => page.id !== id);
        // 위치 재조정
        const updatedPages = filteredPages.map((page, index) => ({
            ...page,
            position: index + 1,
        }));

        if (onPagesChange) {
            onPagesChange(updatedPages);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedPageId(expandedPageId === id ? null : id);
    };

    const renderContentEditor = (page: PageItem) => {
        switch (page.content_type) {
            case "text":
                return (
                    <div className="space-y-2">
                        <Label>텍스트 내용</Label>
                        <MarkdownEditor
                            value={page.content?.content || ""}
                            onChange={(value) => updatePageContent(page.id, { content: value })}
                            placeholder="마크다운 형식으로 내용을 작성하세요"
                            minHeight={200}
                        />
                    </div>
                );

            case "image":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>이미지 URL</Label>
                            <Input
                                value={page.content?.url || ""}
                                onChange={(e) => updatePageContent(page.id, { ...page.content, url: e.target.value })}
                                placeholder="이미지 URL을 입력하세요"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>대체 텍스트</Label>
                            <Input
                                value={page.content?.alt || ""}
                                onChange={(e) => updatePageContent(page.id, { ...page.content, alt: e.target.value })}
                                placeholder="이미지 대체 텍스트를 입력하세요"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>캡션</Label>
                            <Input
                                value={page.content?.caption || ""}
                                onChange={(e) => updatePageContent(page.id, { ...page.content, caption: e.target.value })}
                                placeholder="이미지 캡션을 입력하세요"
                            />
                        </div>
                    </div>
                );

            case "code":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>언어</Label>
                            <Input
                                value={page.content?.language || ""}
                                onChange={(e) => updatePageContent(page.id, { ...page.content, language: e.target.value })}
                                placeholder="코드 언어를 입력하세요 (예: javascript, python)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>코드</Label>
                            <textarea
                                value={page.content?.code || ""}
                                onChange={(e) => updatePageContent(page.id, { ...page.content, code: e.target.value })}
                                placeholder="코드를 입력하세요"
                                className="w-full min-h-[200px] p-2 border rounded-md font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>캡션</Label>
                            <Input
                                value={page.content?.caption || ""}
                                onChange={(e) => updatePageContent(page.id, { ...page.content, caption: e.target.value })}
                                placeholder="코드 캡션을 입력하세요"
                            />
                        </div>
                    </div>
                );

            // 다른 콘텐츠 타입에 대한 에디터도 필요에 따라 추가할 수 있습니다.
            default:
                return (
                    <div className="p-4 bg-gray-100 rounded-md">
                        <p>이 콘텐츠 타입({page.content_type})의 에디터는 아직 구현되지 않았습니다.</p>
                    </div>
                );
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>페이지 관리</CardTitle>
                    {editable && (
                        <Button size="sm" onClick={addPage}>
                            <Plus className="h-4 w-4 mr-1" />
                            페이지 추가
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {pages.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        페이지가 없습니다.
                    </div>
                ) : editable ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="pages">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-3"
                                >
                                    {pages.map((page, index) => (
                                        <Draggable
                                            key={page.id}
                                            draggableId={page.id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="border rounded-md overflow-hidden"
                                                >
                                                    <div className="flex items-center p-3 bg-gray-50">
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="cursor-grab mr-2"
                                                        >
                                                            <GripVertical className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <div className="flex-1 font-medium">
                                                            {expandedPageId === page.id ? (
                                                                <Input
                                                                    value={page.title}
                                                                    onChange={(e) => updatePageTitle(page.id, e.target.value)}
                                                                    className="w-full"
                                                                />
                                                            ) : (
                                                                <span>{page.title || `페이지 ${index + 1}`}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => toggleExpand(page.id)}
                                                            >
                                                                {expandedPageId === page.id ? (
                                                                    <ChevronUp className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removePage(page.id)}
                                                                className="text-red-500"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {expandedPageId === page.id && (
                                                        <div className="p-4 border-t">
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label>콘텐츠 타입</Label>
                                                                    <Select
                                                                        value={page.content_type}
                                                                        onValueChange={(value) => updatePageContentType(page.id, value)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="콘텐츠 타입 선택" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {PAGE_CONTENT_TYPE.map((type) => (
                                                                                <SelectItem key={type} value={type}>
                                                                                    {type === "text" ? "텍스트" :
                                                                                        type === "image" ? "이미지" :
                                                                                            type === "table" ? "테이블" :
                                                                                                type === "code" ? "코드" :
                                                                                                    type === "video" ? "비디오" :
                                                                                                        type === "audio" ? "오디오" :
                                                                                                            type === "mixed" ? "혼합" : type}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                {renderContentEditor(page)}
                                                            </div>
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
                ) : (
                    <div className="space-y-2">
                        {pages.map((page, index) => (
                            <div
                                key={page.id}
                                className="flex items-center py-2 px-3 hover:bg-gray-50 rounded cursor-pointer"
                            >
                                <span className="mr-2 text-gray-500">{index + 1}.</span>
                                <span>{page.title || `페이지 ${index + 1}`}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 