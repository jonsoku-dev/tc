import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { BlockEditorProps } from "../types";
import type { ImageBlock } from "../../types";

export function ImageBlockEditor({
    pageId,
    block,
    isExpanded,
    toggleBlockExpand,
    updateBlock,
}: BlockEditorProps) {
    const imageBlock = block as ImageBlock;

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
                        value={imageBlock.url}
                        onChange={(e) => updateBlock(pageId, block.id, { url: e.target.value })}
                        placeholder="이미지 URL"
                    />
                    <Input
                        value={imageBlock.alt || ""}
                        onChange={(e) => updateBlock(pageId, block.id, { alt: e.target.value })}
                        placeholder="대체 텍스트"
                    />
                    <Input
                        value={imageBlock.caption || ""}
                        onChange={(e) => updateBlock(pageId, block.id, { caption: e.target.value })}
                        placeholder="이미지 설명"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="number"
                            value={imageBlock.width || ""}
                            onChange={(e) => updateBlock(pageId, block.id, { width: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="너비 (px)"
                        />
                        <Input
                            type="number"
                            value={imageBlock.height || ""}
                            onChange={(e) => updateBlock(pageId, block.id, { height: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="높이 (px)"
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 