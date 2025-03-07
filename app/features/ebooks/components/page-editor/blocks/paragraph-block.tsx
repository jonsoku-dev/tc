import { Button } from "~/common/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { BlockEditorProps } from "../types";
import type { ParagraphBlock } from "../../types";

export function ParagraphBlockEditor({
    pageId,
    block,
    isExpanded,
    toggleBlockExpand,
    updateBlock,
}: BlockEditorProps) {
    const paragraphBlock = block as ParagraphBlock;

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
                        value={paragraphBlock.content}
                        onChange={(e) => updateBlock(pageId, block.id, { content: e.target.value })}
                        placeholder="문단 내용을 입력하세요"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <Select
                            value={paragraphBlock.style?.textAlign || "left"}
                            onValueChange={(value) => updateBlock(pageId, block.id, {
                                style: { ...paragraphBlock.style, textAlign: value as any }
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
                            value={paragraphBlock.style?.fontWeight || "normal"}
                            onValueChange={(value) => updateBlock(pageId, block.id, {
                                style: { ...paragraphBlock.style, fontWeight: value as any }
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
} 