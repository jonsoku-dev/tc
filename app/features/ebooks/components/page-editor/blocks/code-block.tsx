import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { BlockEditorProps } from "../types";
import type { CodeBlock } from "../../types";

export function CodeBlockEditor({
    pageId,
    block,
    isExpanded,
    toggleBlockExpand,
    updateBlock,
}: BlockEditorProps) {
    const codeBlock = block as CodeBlock;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="font-medium">코드</div>
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
                    <Select
                        value={codeBlock.language || "javascript"}
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
                            <SelectItem value="plaintext">Plain Text</SelectItem>
                        </SelectContent>
                    </Select>
                    <textarea
                        className="w-full min-h-[150px] p-2 border rounded font-mono text-sm"
                        value={codeBlock.code}
                        onChange={(e) => updateBlock(pageId, block.id, { code: e.target.value })}
                        placeholder="코드를 입력하세요"
                    />
                    <Input
                        value={codeBlock.caption || ""}
                        onChange={(e) => updateBlock(pageId, block.id, { caption: e.target.value })}
                        placeholder="코드 설명 (선택사항)"
                    />
                </div>
            )}
        </div>
    );
} 