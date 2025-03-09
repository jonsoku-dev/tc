import { useEffect, useRef, useState } from "react";
import type { EbookPage, Block, Highlight } from "./types";
import { MarkdownRenderer } from "./markdown-renderer";
import { TextSelectionMenu } from "./text-selection-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/common/components/ui/hover-card";
import { CalendarIcon, Clock, Edit3, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PageRendererProps {
    page: EbookPage;
    highlights?: Highlight[];
    onTextSelect?: (selection: { text: string; startOffset: number; endOffset: number; pageNumber: number; blockId: string | null; blockType: string | null; color?: string }) => void;
    className?: string;
}

// 하이라이트 컴포넌트
interface HighlightedTextProps {
    text: string;
    highlight: Highlight;
}

function HighlightedText({ text, highlight }: HighlightedTextProps) {
    // 유효한 하이라이트인지 확인
    const isValidHighlight = highlight && highlight.id && highlight.color;

    // 유효하지 않은 하이라이트인 경우 일반 텍스트로 표시
    if (!isValidHighlight) {
        return <span>{text}</span>;
    }

    // HoverCard를 사용하여 하이라이트 정보 표시
    return (
        <HoverCard openDelay={300} closeDelay={200}>
            <HoverCardTrigger asChild>
                <span
                    className="rounded px-0.5 cursor-pointer"
                    style={{ backgroundColor: highlight.color + "80" }} // 80은 50% 투명도
                    data-highlight-id={highlight.id}
                >
                    {text}
                </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div
                                className="h-4 w-4 rounded-full mr-2"
                                style={{ backgroundColor: highlight.color }}
                            />
                            <span className="text-sm font-medium">하이라이트</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDistanceToNow(highlight.createdAt, { addSuffix: true, locale: ko })}</span>
                        </div>
                    </div>

                    <div className="text-sm border-l-2 pl-2 py-1" style={{ borderColor: highlight.color }}>
                        {text}
                    </div>

                    {highlight.note && (
                        <div className="mt-2">
                            <div className="flex items-center text-xs text-muted-foreground mb-1">
                                <Edit3 className="h-3 w-3 mr-1" />
                                <span>노트</span>
                            </div>
                            <div className="text-sm bg-muted p-2 rounded">
                                {highlight.note}
                            </div>
                        </div>
                    )}

                    {highlight.blockType && (
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <Info className="h-3 w-3 mr-1" />
                            <span>블록 타입: {highlight.blockType}</span>
                        </div>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

export function PageRenderer({ page, highlights = [], onTextSelect, className = "" }: PageRendererProps) {
    const pageRef = useRef<HTMLDivElement>(null);

    // 디버깅을 위한 로그 추가
    useEffect(() => {
        if (highlights.length > 0) {
            console.log(`페이지 ${page.page_number}에 ${highlights.length}개의 하이라이트가 있습니다.`);
        }
    }, [highlights, page.page_number]);

    // 하이라이트 겹침 확인 함수
    const checkHighlightOverlap = (
        startOffset: number,
        endOffset: number,
        blockId: string | null
    ): boolean => {
        // 현재 페이지의 하이라이트만 필터링
        const pageHighlights = highlights.filter(h => h.pageNumber === page.page_number);

        // 블록 ID가 있는 경우 해당 블록의 하이라이트만 필터링
        const relevantHighlights = blockId
            ? pageHighlights.filter(h => !h.blockId || h.blockId === blockId)
            : pageHighlights;

        // 겹치는 하이라이트가 있는지 확인
        return relevantHighlights.some(h => {
            // 두 범위가 겹치는지 확인 (한쪽이 다른쪽에 완전히 포함되거나, 부분적으로 겹치는 경우)
            const isOverlapping = (
                (startOffset <= h.startOffset && endOffset > h.startOffset) || // 왼쪽에서 겹침
                (startOffset >= h.startOffset && startOffset < h.endOffset) || // 오른쪽에서 겹침
                (startOffset >= h.startOffset && endOffset <= h.endOffset) || // 완전히 포함됨
                (startOffset <= h.startOffset && endOffset >= h.endOffset)    // 완전히 포함함
            );

            return isOverlapping;
        });
    };

    // 하이라이트 적용 함수 - 겹치는 하이라이트 처리 개선
    const applyHighlights = (content: string, blockHighlights: Highlight[], blockId: string) => {
        if (!blockHighlights.length) return content;

        // 모든 위치에 대한 하이라이트 정보를 저장할 배열
        // 각 문자 위치마다 적용될 하이라이트 정보를 저장
        const positionMap: (Highlight | null)[] = new Array(content.length).fill(null);

        // 하이라이트 정보를 위치 맵에 기록
        // 우선순위: 1) 노트가 있는 하이라이트, 2) 최근에 생성된 하이라이트
        const sortedHighlights = [...blockHighlights]
            .filter(h => {
                // blockId가 없거나 현재 블록과 일치하는 하이라이트만 필터링
                // 또한 startOffset과 endOffset이 유효한 범위인지 확인
                return (!h.blockId || h.blockId === blockId) &&
                    h.startOffset >= 0 &&
                    h.endOffset <= content.length &&
                    h.startOffset < h.endOffset;
            })
            .sort((a, b) => {
                // 노트가 있는 하이라이트 우선
                if (a.note && !b.note) return -1;
                if (!a.note && b.note) return 1;
                // 최근 생성된 하이라이트 우선
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

        // 각 하이라이트를 위치 맵에 기록
        for (const highlight of sortedHighlights) {
            try {
                const start = Math.max(0, highlight.startOffset);
                const end = Math.min(content.length, highlight.endOffset);

                // 유효한 범위인지 다시 한번 확인
                if (start < end && start >= 0 && end <= content.length) {
                    // 이 범위에 이미 하이라이트가 있는지 확인
                    let hasExistingHighlight = false;
                    for (let i = start; i < end; i++) {
                        if (positionMap[i] !== null) {
                            hasExistingHighlight = true;
                            break;
                        }
                    }

                    // 겹치는 하이라이트가 없는 경우에만 적용
                    if (!hasExistingHighlight) {
                        for (let i = start; i < end; i++) {
                            positionMap[i] = highlight;
                        }
                    } else {
                        console.log(`겹치는 하이라이트가 있어 건너뜁니다: ${highlight.id}`);
                    }
                }
            } catch (error) {
                console.error("하이라이트 적용 중 오류 발생:", error, highlight);
                // 오류가 발생해도 계속 진행
                continue;
            }
        }

        // 위치 맵을 기반으로 결과 생성
        let result = [];
        let currentHighlight: Highlight | null = null;
        let currentText = '';
        let i = 0;

        while (i < content.length) {
            const highlightAtPosition = positionMap[i];

            // 하이라이트가 변경되었거나 끝났을 때
            if (highlightAtPosition !== currentHighlight) {
                // 이전 텍스트 처리
                if (currentText) {
                    if (currentHighlight) {
                        // 하이라이트된 텍스트 추가
                        result.push(
                            <HighlightedText
                                key={`${currentHighlight.id}-${i - currentText.length}`}
                                text={currentText}
                                highlight={currentHighlight}
                            />
                        );
                    } else {
                        // 일반 텍스트 추가
                        result.push(currentText);
                    }
                    currentText = '';
                }

                // 현재 하이라이트 업데이트
                currentHighlight = highlightAtPosition;
            }

            // 현재 문자 추가
            currentText += content[i];
            i++;
        }

        // 마지막 텍스트 처리
        if (currentText) {
            if (currentHighlight) {
                result.push(
                    <HighlightedText
                        key={`${currentHighlight.id}-${content.length - currentText.length}`}
                        text={currentText}
                        highlight={currentHighlight}
                    />
                );
            } else {
                result.push(currentText);
            }
        }

        return result;
    };

    // 블록 렌더링
    const renderBlock = (block: Block) => {
        // 현재 블록에 해당하는 하이라이트만 필터링
        const blockHighlights = highlights.filter(h => {
            // 페이지 번호가 일치하고
            const isPageMatch = h.pageNumber === page.page_number;

            // 블록 ID가 없거나 현재 블록과 일치하는 경우
            const isBlockMatch = !h.blockId || h.blockId === block.id;

            // 유효한 하이라이트 범위인지 확인
            const isValidRange = h.startOffset >= 0 && h.startOffset < h.endOffset;

            return isPageMatch && isBlockMatch && isValidRange;
        });

        // 블록 내용을 TextSelectionMenu로 감싸기
        const renderBlockContent = () => {
            switch (block.type) {
                case "paragraph":
                    return (
                        <p
                            className="my-4"
                            data-block-id={block.id}
                            data-block-type={block.type}
                            style={{
                                fontSize: block.style?.fontSize,
                                lineHeight: block.style?.lineHeight,
                                textAlign: block.style?.textAlign,
                                fontWeight: block.style?.fontWeight,
                                fontStyle: block.style?.fontStyle,
                            }}
                        >
                            {applyHighlights(block.content, blockHighlights, block.id)}
                        </p>
                    );
                case "heading":
                    const headingContent = applyHighlights(block.content, blockHighlights, block.id);
                    switch (block.level) {
                        case 1: return <h1 className="text-3xl font-bold my-4" data-block-id={block.id} data-block-type={block.type}>{headingContent}</h1>;
                        case 2: return <h2 className="text-2xl font-bold my-4" data-block-id={block.id} data-block-type={block.type}>{headingContent}</h2>;
                        case 3: return <h3 className="text-xl font-bold my-4" data-block-id={block.id} data-block-type={block.type}>{headingContent}</h3>;
                        case 4: return <h4 className="text-lg font-bold my-4" data-block-id={block.id} data-block-type={block.type}>{headingContent}</h4>;
                        case 5: return <h5 className="text-base font-bold my-4" data-block-id={block.id} data-block-type={block.type}>{headingContent}</h5>;
                        case 6: return <h6 className="text-sm font-bold my-4" data-block-id={block.id} data-block-type={block.type}>{headingContent}</h6>;
                        default: return <h2 className="text-2xl font-bold my-4" data-block-id={block.id} data-block-type={block.type}>{headingContent}</h2>;
                    }
                case "image":
                    return (
                        <figure className="my-4" data-block-id={block.id} data-block-type={block.type}>
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
                        <div className="my-4" data-block-id={block.id} data-block-type={block.type}>
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
                        <div className="my-4 overflow-x-auto" data-block-id={block.id} data-block-type={block.type}>
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
                        <figure className="my-4" data-block-id={block.id} data-block-type={block.type}>
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
                        <figure className="my-4" data-block-id={block.id} data-block-type={block.type}>
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
                        <div data-block-id={block.id} data-block-type={block.type}>
                            <MarkdownRenderer
                                content={block.content}
                                highlights={blockHighlights}
                                onTextSelect={onTextSelect ?
                                    ({ text, startOffset, endOffset, blockId, blockType, color }) =>
                                        onTextSelect({
                                            text,
                                            startOffset,
                                            endOffset,
                                            pageNumber: page.page_number,
                                            blockId: block.id,
                                            blockType: block.type,
                                            color
                                        })
                                    : undefined as any}
                                pageNumber={page.page_number}
                            />
                        </div>
                    );
                default:
                    return <div>지원되지 않는 블록 타입입니다.</div>;
            }
        };

        // 텍스트 선택 메뉴로 블록 내용 감싸기
        return (
            <TextSelectionMenu
                key={block.id}
                onAddHighlight={onTextSelect ?
                    (highlight) => {
                        // 겹치는 하이라이트가 있는지 확인
                        const hasOverlap = checkHighlightOverlap(
                            highlight.startOffset,
                            highlight.endOffset,
                            highlight.blockId as string | null
                        );

                        // 겹치는 하이라이트가 없는 경우에만 추가
                        if (!hasOverlap) {
                            onTextSelect({
                                text: highlight.text,
                                startOffset: highlight.startOffset,
                                endOffset: highlight.endOffset,
                                pageNumber: page.page_number,
                                blockId: highlight.blockId as string | null,
                                blockType: highlight.blockType as string | null,
                                color: highlight.color
                            });
                        } else {
                            console.warn("겹치는 하이라이트가 있어 추가하지 않습니다.");
                        }
                    } : () => { }}
                pageNumber={page.page_number}
                checkOverlap={(startOffset, endOffset, blockId) =>
                    checkHighlightOverlap(startOffset, endOffset, blockId)}
            >
                {renderBlockContent()}
            </TextSelectionMenu>
        );
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