import { useEffect, useRef } from "react";
import type { EbookPage, PageContent, PageContentType, Highlight } from "./types";
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

    // 페이지 콘텐츠 타입에 따른 렌더링
    const renderContent = () => {
        switch (page.content_type) {
            case "text":
                return (
                    <MarkdownRenderer
                        content={(page.content as any).content}
                        highlights={highlights.filter(h => h.pageNumber === page.page_number)}
                        onTextSelect={onTextSelect ?
                            ({ text, startOffset, endOffset }) =>
                                onTextSelect({ text, startOffset, endOffset, pageNumber: page.page_number })
                            : undefined as any}
                    />
                );
            case "image":
                const imageContent = page.content as any;
                return (
                    <figure className="my-4">
                        <img
                            src={imageContent.url}
                            alt={imageContent.alt || ""}
                            className="max-w-full mx-auto"
                            style={{
                                width: imageContent.width ? `${imageContent.width}px` : 'auto',
                                height: imageContent.height ? `${imageContent.height}px` : 'auto',
                            }}
                        />
                        {imageContent.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                                {imageContent.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case "table":
                const tableContent = page.content as any;
                return (
                    <div className="my-4 overflow-x-auto">
                        {tableContent.caption && (
                            <div className="text-center text-sm text-gray-500 mb-2">
                                {tableContent.caption}
                            </div>
                        )}
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr>
                                    {tableContent.headers.map((header: string, index: number) => (
                                        <th key={index} className="border border-gray-300 bg-gray-100 px-4 py-2 text-left">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableContent.rows.map((row: string[], rowIndex: number) => (
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
            case "code":
                const codeContent = page.content as any;
                return (
                    <div className="my-4">
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                            <code className={`language-${codeContent.language}`}>
                                {codeContent.code}
                            </code>
                        </pre>
                        {codeContent.caption && (
                            <div className="text-center text-sm text-gray-500 mt-2">
                                {codeContent.caption}
                            </div>
                        )}
                    </div>
                );
            case "video":
                const videoContent = page.content as any;
                return (
                    <figure className="my-4">
                        <video
                            src={videoContent.url}
                            controls={videoContent.controls !== false}
                            autoPlay={videoContent.autoplay || false}
                            className="max-w-full mx-auto"
                        />
                        {videoContent.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                                {videoContent.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case "audio":
                const audioContent = page.content as any;
                return (
                    <figure className="my-4">
                        <audio
                            src={audioContent.url}
                            controls={audioContent.controls !== false}
                            autoPlay={audioContent.autoplay || false}
                            className="w-full"
                        />
                        {audioContent.caption && (
                            <figcaption className="text-center text-sm text-gray-500 mt-2">
                                {audioContent.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            case "mixed":
                const mixedContent = page.content as any;
                return (
                    <div className="my-4">
                        {mixedContent.blocks.map((block: any, index: number) => (
                            <div key={index} className="mb-4">
                                <PageRenderer
                                    page={{
                                        ...page,
                                        content_type: block.type as PageContentType,
                                        content: block.content,
                                    }}
                                    highlights={highlights}
                                    onTextSelect={onTextSelect}
                                />
                            </div>
                        ))}
                    </div>
                );
            default:
                return <div>지원되지 않는 콘텐츠 타입입니다.</div>;
        }
    };

    return (
        <div ref={pageRef} className={`page-renderer ${className}`}>
            {page.title && <h2 className="text-xl font-bold mb-4">{page.title}</h2>}
            {renderContent()}
        </div>
    );
} 