import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Highlight {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    color: string;
    note?: string;
    createdAt: Date;
}

interface MarkdownRendererProps {
    content: string;
    highlights: Highlight[];
    onTextSelect: (selection: { text: string; startOffset: number; endOffset: number }) => void;
}

export function MarkdownRenderer({ content, highlights, onTextSelect }: MarkdownRendererProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const headingIndexRef = useRef(0);

    // 콘텐츠가 변경될 때마다 인덱스 초기화
    useEffect(() => {
        headingIndexRef.current = 0;
    }, [content]);

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || !contentRef.current) return;

            const range = selection.getRangeAt(0);
            const text = selection.toString().trim();
            if (!text) return;

            const startOffset = range.startOffset;
            const endOffset = range.endOffset;
            onTextSelect({ text, startOffset, endOffset });
        };

        document.addEventListener("mouseup", handleSelection);
        return () => document.removeEventListener("mouseup", handleSelection);
    }, [onTextSelect]);

    // 하이라이트 적용 (미구현 상태)
    const applyHighlights = (content: string, highlights: Highlight[]) => {
        // TODO: 하이라이트를 DOM에 적용하려면 별도의 매핑 로직 필요
        return content;
    };

    const highlightedContent = applyHighlights(content, highlights);

    return (
        <div ref={contentRef} className="prose max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2: ({ children }) => {
                        const index = headingIndexRef.current;
                        headingIndexRef.current += 1;
                        return <h2 id={`section-${index}`}>{children}</h2>;
                    },
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
                {highlightedContent}
            </ReactMarkdown>
        </div>
    );
}