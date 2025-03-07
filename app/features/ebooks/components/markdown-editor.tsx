import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { Card } from "~/common/components/ui/card";
import { Textarea } from "~/common/components/ui/textarea";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
    className?: string;
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder = "마크다운 형식으로 내용을 작성하세요...",
    minHeight = 300,
    className = "",
}: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState<string>("edit");

    // 마크다운 렌더링 함수
    function MarkdownRenderer({ content }: { content: string }) {
        return (
            <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // 코드 블록 스타일링
                        code(props) {
                            const { children, className, node, ...rest } = props;
                            const match = /language-(\w+)/.exec(className || '');
                            return !className?.includes('language-') ? (
                                <code className={`bg-gray-100 px-1 py-0.5 rounded ${className}`} {...rest}>
                                    {children}
                                </code>
                            ) : (
                                <pre className={`bg-gray-100 p-4 rounded-md overflow-auto ${className}`}>
                                    <code className={className} {...rest}>
                                        {children}
                                    </code>
                                </pre>
                            );
                        },
                        // 테이블 스타일링
                        table(props) {
                            const { children, ...rest } = props;
                            return (
                                <div className="overflow-x-auto">
                                    <table className="border-collapse border border-gray-300 w-full" {...rest}>
                                        {children}
                                    </table>
                                </div>
                            );
                        },
                        th(props) {
                            const { children, ...rest } = props;
                            return (
                                <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left" {...rest}>
                                    {children}
                                </th>
                            );
                        },
                        td(props) {
                            const { children, ...rest } = props;
                            return (
                                <td className="border border-gray-300 px-4 py-2" {...rest}>
                                    {children}
                                </td>
                            );
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    }

    return (
        <Card className={`overflow-hidden ${className}`}>
            <Tabs
                defaultValue="edit"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <div className="px-4 pt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">편집</TabsTrigger>
                        <TabsTrigger value="preview">미리보기</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="edit" className="p-4 mt-0">
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[300px] font-mono resize-none"
                        style={{ minHeight: `${minHeight}px` }}
                    />
                </TabsContent>

                <TabsContent value="preview" className="p-4 mt-0">
                    {value ? (
                        <MarkdownRenderer content={value} />
                    ) : (
                        <div className="text-gray-400">내용이 없습니다.</div>
                    )}
                </TabsContent>
            </Tabs>
        </Card>
    );
} 