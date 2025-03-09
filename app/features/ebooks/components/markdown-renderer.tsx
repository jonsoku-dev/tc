import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TextSelectionMenu } from "./text-selection-menu";

interface Highlight {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    color: string;
    note?: string;
    createdAt: Date;
    blockId?: string;
    blockType?: string;
}

interface MarkdownRendererProps {
    content: string;
    highlights: Highlight[];
    onTextSelect: (selection: { text: string; startOffset: number; endOffset: number; blockId?: string; blockType?: string; color?: string }) => void;
    pageNumber: number;
}

export function MarkdownRenderer({ content, highlights, onTextSelect, pageNumber }: MarkdownRendererProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const headingIndexRef = useRef(0);

    // 콘텐츠가 변경될 때마다 인덱스 초기화
    useEffect(() => {
        headingIndexRef.current = 0;
    }, [content]);

    // 하이라이트 적용
    const applyHighlights = (content: string, highlights: Highlight[]) => {
        if (!highlights || highlights.length === 0) return content;

        // 하이라이트를 적용하기 위해 마크다운 콘텐츠에 HTML 태그 추가
        // 이 방식은 단순한 구현이며, 실제로는 더 복잡한 로직이 필요할 수 있음
        let highlightedContent = content;

        // 하이라이트를 위치 기준으로 정렬 (뒤에서부터 적용해야 오프셋이 변하지 않음)
        const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

        for (const highlight of sortedHighlights) {
            // 블록 ID가 있고 현재 블록과 일치하는지 확인
            const blockId = contentRef.current?.getAttribute('data-block-id');
            if (highlight.blockId && blockId && highlight.blockId !== blockId) {
                continue; // 다른 블록의 하이라이트는 건너뜀
            }

            const { startOffset, endOffset, color } = highlight;

            // 하이라이트 범위가 유효한지 확인
            if (startOffset >= 0 && endOffset > startOffset && endOffset <= highlightedContent.length) {
                const before = highlightedContent.substring(0, startOffset);
                const highlighted = highlightedContent.substring(startOffset, endOffset);
                const after = highlightedContent.substring(endOffset);

                highlightedContent = `${before}<span style="background-color: ${color};">${highlighted}</span>${after}`;
            }
        }

        return highlightedContent;
    };

    const highlightedContent = applyHighlights(content, highlights);

    return (
        <TextSelectionMenu
            onAddHighlight={(highlight) => onTextSelect({
                text: highlight.text,
                startOffset: highlight.startOffset,
                endOffset: highlight.endOffset,
                blockId: highlight.blockId,
                blockType: highlight.blockType,
                color: highlight.color
            })}
            pageNumber={pageNumber}
        >
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
        </TextSelectionMenu>
    );
}