import { useEffect, useRef } from "react";
import type { EbookPage, Block, Highlight } from "./types";
import { MarkdownRenderer } from "./markdown-renderer";

interface PageRendererProps {
    page: EbookPage;
    highlights?: Highlight[];
    onTextSelect?: (selection: { text: string; startOffset: number; endOffset: number; pageNumber: number }) => void;
    className?: string;
}

export function PageRenderer({ page, highlights = [], onTextSelect, className = "" }: PageRendererProps) {
    const pageRef = useRef<HTMLDivElement>(null);

    // 텍스트 선택 이벤트 처리
    useEffect(() => {
        if (!onTextSelect) return;

        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || !pageRef.current) return;

            const range = selection.getRangeAt(0);
            const text = selection.toString().trim();
            if (!text) return;

            const startOffset = range.startOffset;
            const endOffset = range.endOffset;

            onTextSelect({
                text,
                startOffset,
                endOffset,
                pageNumber: page.page_number
            });
        };

        document.addEventListener("mouseup", handleSelection);
        return () => document.removeEventListener("mouseup", handleSelection);
    }, [onTextSelect, page.page_number]);

    // 블록 렌더링
    const renderBlock = (block: Block) => {
        switch (block.type) {
            case "paragraph":
                return (
                    <p
                        className="my-4"
                        style={{
                            fontSize: block.style?.fontSize,
                            lineHeight: block.style?.lineHeight,
                            textAlign: block.style?.textAlign,
                            fontWeight: block.style?.fontWeight,
                            fontStyle: block.style?.fontStyle,
                        }}
                    >
                        {block.content}
                    </p>
                );
            case "heading":
                switch (block.level) {
                    case 1: return <h1 className="text-3xl font-bold my-4">{block.content}</h1>;
                    case 2: return <h2 className="text-2xl font-bold my-4">{block.content}</h2>;
                    case 3: return <h3 className="text-xl font-bold my-4">{block.content}</h3>;
                    case 4: return <h4 className="text-lg font-bold my-4">{block.content}</h4>;
                    case 5: return <h5 className="text-base font-bold my-4">{block.content}</h5>;
                    case 6: return <h6 className="text-sm font-bold my-4">{block.content}</h6>;
                    default: return <h2 className="text-2xl font-bold my-4">{block.content}</h2>;
                }
            case "image":
                return (
                    <figure className="my-4">
                        <img
                            src={block.url}
                            alt={block.alt || ""}
                            className="max-w-full mx-auto"
                            style={{
                                width: block.width ? `${block.width}px` : 'auto',
                                height: block.height ? `${block.height}px` : 'auto',
                            }}
                        />
                        {block.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                                {block.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case "code":
                return (
                    <div className="my-4">
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                            <code className={`language-${block.language || 'text'}`}>
                                {block.code}
                            </code>
                        </pre>
                        {block.caption && (
                            <div className="text-center text-sm text-gray-500 mt-2">
                                {block.caption}
                            </div>
                        )}
                    </div>
                );
            case "table":
                return (
                    <div className="my-4 overflow-x-auto">
                        {block.caption && (
                            <div className="text-center text-sm text-gray-500 mb-2">
                                {block.caption}
                            </div>
                        )}
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    {block.headers.map((header, index) => (
                                        <th key={index} className="border border-gray-300 bg-gray-100 px-4 py-2 text-left">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {block.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case "video":
                return (
                    <figure className="my-4">
                        <video
                            src={block.url}
                            controls={block.controls !== false}
                            autoPlay={block.autoplay || false}
                            className="max-w-full mx-auto"
                        />
                        {block.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                                {block.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case "audio":
                return (
                    <figure className="my-4">
                        <audio
                            src={block.url}
                            controls={block.controls !== false}
                            autoPlay={block.autoplay || false}
                            className="w-full"
                        />
                        {block.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                                {block.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case "markdown":
                return (
                    <MarkdownRenderer
                        content={block.content}
                        highlights={highlights.filter(h => h.pageNumber === page.page_number)}
                        onTextSelect={onTextSelect ?
                            ({ text, startOffset, endOffset }) =>
                                onTextSelect({ text, startOffset, endOffset, pageNumber: page.page_number })
                            : undefined as any}
                    />
                );
            default:
                return <div>지원되지 않는 블록 타입입니다.</div>;
        }
    };

    return (
        <div ref={pageRef} className={`page-renderer ${className}`}>
            {page.title && <h2 className="text-xl font-bold mb-4">{page.title}</h2>}

            <div className="blocks-container">
                {page.blocks.map((block, index) => (
                    <div key={block.id || index} className="block-wrapper">
                        {renderBlock(block)}
                    </div>
                ))}
            </div>
        </div>
    );
} 