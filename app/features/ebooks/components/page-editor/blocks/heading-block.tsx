import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { BlockEditorProps } from "../types";
import type { HeadingBlock } from "../../types";

export function HeadingBlockEditor({
    pageId,
    block,
    isExpanded,
    toggleBlockExpand,
    updateBlock,
}: BlockEditorProps) {
    const headingBlock = block as HeadingBlock;

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
                        value={headingBlock.content}
                        onChange={(e) => updateBlock(pageId, block.id, { content: e.target.value })}
                        placeholder="제목을 입력하세요"
                    />
                    <Select
                        value={headingBlock.level.toString()}
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
} 