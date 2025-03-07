import { useEffect, useRef } from "react";
import type { EbookPage, BlockBasedPage, Block, Highlight } from "./types";
import { MarkdownRenderer } from "./markdown-renderer";

interface PageRendererProps {
    page: EbookPage | BlockBasedPage;
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

    // 블록 기반 페이지인지 확인
    const isBlockBasedPage = (page: EbookPage | BlockBasedPage): page is BlockBasedPage => {
        return 'blocks' in page;
    };

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

    // 레거시 콘텐츠 타입에 따른 렌더링 (이전 버전과의 호환성 유지)
    const renderLegacyContent = () => {
        if (isBlockBasedPage(page)) return null;

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
                            <code className={`language-${codeContent?.language || 'text'}`}>
                                {codeContent?.code || ''}
                            </code>
                        </pre>
                        {codeContent?.caption && (
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
                        {mixedContent?.blocks?.map((block: any, index: number) => {
                            // 각 블록 타입에 맞는 content 구조 생성
                            let blockContent;

                            switch (block.type) {
                                case "text":
                                    blockContent = { content: block.content };
                                    break;
                                case "image":
                                    blockContent = block;
                                    break;
                                case "code":
                                    blockContent = {
                                        language: block.language,
                                        code: block.code,
                                        caption: block.caption
                                    };
                                    break;
                                case "video":
                                case "audio":
                                    blockContent = {
                                        url: block.url,
                                        caption: block.caption,
                                        controls: block.controls,
                                        autoplay: block.autoplay
                                    };
                                    break;
                                default:
                                    blockContent = block;
                            }

                            return (
                                <div key={index} className="mb-4">
                                    <PageRenderer
                                        page={{
                                            ...page,
                                            content_type: block.type,
                                            content: blockContent,
                                        }}
                                        highlights={highlights}
                                        onTextSelect={onTextSelect}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            default:
                return <div>지원되지 않는 콘텐츠 타입입니다.</div>;
        }
    };

    return (
        <div ref={pageRef} className={`page-renderer ${className}`}>
            {page.title && <h2 className="text-xl font-bold mb-4">{page.title}</h2>}

            {isBlockBasedPage(page) ? (
                // 블록 기반 페이지 렌더링
                <div className="blocks-container">
                    {page.blocks.map((block, index) => (
                        <div key={block.id || index} className="block-wrapper">
                            {renderBlock(block)}
                        </div>
                    ))}
                </div>
            ) : (
                // 레거시 콘텐츠 렌더링
                renderLegacyContent()
            )}
        </div>
    );
} 