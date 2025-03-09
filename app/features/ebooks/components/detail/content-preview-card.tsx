import { useState, useEffect } from "react";
import { FileText, AlertCircle, Copy, Check, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { CardFooter } from "~/common/components/ui/card";
import { EbookCardFrame } from "./ebook-card-frame";
import { ScrollArea } from "~/common/components/ui/scroll-area";
import { Alert, AlertDescription } from "~/common/components/ui/alert";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ContentPreviewCardProps {
    content: string;
    className?: string;
}

// 마크다운 렌더러 컴포넌트
function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
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

// 소스 코드 뷰어 컴포넌트
function SourceViewer({ content }: { content: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 bg-white hover:bg-gray-100"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    {copied ? "복사됨" : "복사"}
                </Button>
            </div>
            <pre className="p-4 pt-12 bg-gray-50 rounded-md font-mono text-sm leading-relaxed overflow-auto border">
                {content}
            </pre>
        </div>
    );
}

// 빈 콘텐츠 표시 컴포넌트
function EmptyContent() {
    return (
        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">미리보기 콘텐츠가 없습니다</h3>
            <p className="text-gray-500 max-w-md mb-4">
                이 전자책은 현재 미리보기 콘텐츠를 제공하지 않습니다. 전체 내용을 보려면 구매하거나 읽기 버튼을 클릭하세요.
            </p>
            <Button variant="outline" className="mt-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                샘플 요청하기
            </Button>
        </div>
    );
}

// 콘텐츠 탭 컴포넌트
function ContentTabs({ content, contentHeight }: { content: string, contentHeight: number | null }) {
    const [activeTab, setActiveTab] = useState("preview");

    return (
        <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
            <div className="px-6 pt-6 flex items-center justify-between">
                <TabsList className="mb-4">
                    <TabsTrigger value="preview">미리보기</TabsTrigger>
                    <TabsTrigger value="source">소스</TabsTrigger>
                </TabsList>

                {activeTab === "preview" && (
                    <Badge variant="outline" className="text-xs font-normal">
                        마크다운 지원
                    </Badge>
                )}
            </div>

            <TabsContent value="preview" className="px-6">
                <ScrollArea className="overflow-auto pr-4" style={{ height: contentHeight ? `${contentHeight}px` : 'auto' }}>
                    <MarkdownRenderer content={content} />
                </ScrollArea>
            </TabsContent>

            <TabsContent value="source" className="px-6">
                <ScrollArea className="overflow-auto pr-4" style={{ height: contentHeight ? `${contentHeight}px` : 'auto' }}>
                    <SourceViewer content={content} />
                </ScrollArea>
            </TabsContent>
        </Tabs>
    );
}

export function ContentPreviewCard({
    content,
    className = ""
}: ContentPreviewCardProps) {
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const hasContent = content && content.trim().length > 0;

    // 컨텐츠 높이 계산 (최대 400px, 최소 150px)
    useEffect(() => {
        if (hasContent) {
            // 컨텐츠 길이에 따라 높이 계산 (대략적인 추정)
            const contentLines = content.split('\n').length;
            const estimatedHeight = Math.min(Math.max(contentLines * 22, 150), 400);
            setContentHeight(estimatedHeight);
        } else {
            setContentHeight(null); // 컨텐츠가 없을 경우 자동 높이
        }
    }, [content, hasContent]);

    return (
        <EbookCardFrame
            title="콘텐츠 미리보기"
            icon={FileText}
            className={className}
            contentClassName="p-0"
        >
            {hasContent ? (
                <>
                    <ContentTabs content={content} contentHeight={contentHeight} />

                    <CardFooter className="bg-gray-50 border-t mt-4 py-3">
                        <div className="flex items-center text-sm text-gray-500">
                            <AlertCircle className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                            <p>
                                이 미리보기는 전체 콘텐츠의 일부만 보여줍니다. 전체 내용을 보려면 구매하거나 읽기 버튼을 클릭하세요.
                            </p>
                        </div>
                    </CardFooter>
                </>
            ) : (
                <EmptyContent />
            )}
        </EbookCardFrame>
    );
} 