import { Button } from "~/common/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { MarkdownEditor } from "../../markdown-editor";
import type { BlockEditorProps } from "../types";
import type { MarkdownBlock } from "../../types";

export function MarkdownBlockEditor({
    pageId,
    block,
    isExpanded,
    toggleBlockExpand,
    updateBlock,
}: BlockEditorProps) {
    const markdownBlock = block as MarkdownBlock;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="font-medium">마크다운</div>
                <Button
                    type="button"
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
                        value={markdownBlock.content}
                        onChange={(value) => updateBlock(pageId, block.id, { content: value })}
                        minHeight={200}
                    />
                </div>
            )}
        </div>
    );
} 