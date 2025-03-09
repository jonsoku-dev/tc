import React, { useState, useEffect, useRef } from "react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
} from "~/common/components/ui/context-menu";
import type { Highlight } from "./types";

interface TextSelectionMenuProps {
    children: React.ReactNode;
    onAddHighlight: (highlight: Omit<Highlight, "id" | "createdAt">) => void;
    pageNumber: number;
}

export function TextSelectionMenu({
    children,
    onAddHighlight,
    pageNumber,
}: TextSelectionMenuProps) {
    const [selectedText, setSelectedText] = useState<{
        text: string;
        startOffset: number;
        endOffset: number;
        blockId?: string | null;
        blockType?: string | null;
    } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 텍스트 선택 이벤트 처리
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || !containerRef.current) return;

            const range = selection.getRangeAt(0);
            const text = selection.toString().trim();
            if (!text) return;

            // 선택된 텍스트가 속한 블록 요소 찾기
            const startContainer = range.startContainer;
            let blockElement = startContainer.parentElement;

            // 블록 요소 찾기 (최대 5단계까지 상위로 탐색)
            let blockId = null;
            let blockType = null;
            let currentElement = blockElement;
            let depth = 0;

            while (currentElement && depth < 5) {
                const dataBlockId = currentElement.getAttribute('data-block-id');
                const dataBlockType = currentElement.getAttribute('data-block-type');

                if (dataBlockId && dataBlockType) {
                    blockId = dataBlockId;
                    blockType = dataBlockType;
                    break;
                }

                currentElement = currentElement.parentElement;
                depth++;
            }

            setSelectedText({
                text,
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                blockId,
                blockType,
            });
        };

        // 모바일 환경에서 길게 누르기 동작 처리
        let longPressTimer: ReturnType<typeof setTimeout> | null = null;
        let isTouching = false;

        const handleTouchStart = (e: TouchEvent) => {
            // 이미 선택된 텍스트가 있으면 처리하지 않음
            if (window.getSelection()?.toString().trim()) {
                return;
            }

            isTouching = true;

            // 길게 누르기 타이머 설정 (500ms)
            longPressTimer = setTimeout(() => {
                if (isTouching) {
                    // 모바일 브라우저의 기본 컨텍스트 메뉴를 방지
                    e.preventDefault();

                    // 선택 처리
                    handleSelection();
                }
            }, 500);
        };

        const handleTouchEnd = () => {
            isTouching = false;
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        const handleTouchMove = () => {
            // 터치 이동 시 길게 누르기 취소
            isTouching = false;
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        // 이벤트 리스너 등록
        document.addEventListener("mouseup", handleSelection);
        document.addEventListener("touchstart", handleTouchStart, { passive: false });
        document.addEventListener("touchend", handleTouchEnd);
        document.addEventListener("touchmove", handleTouchMove);

        // 클린업 함수
        return () => {
            document.removeEventListener("mouseup", handleSelection);
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchend", handleTouchEnd);
            document.removeEventListener("touchmove", handleTouchMove);

            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
        };
    }, []);

    // 하이라이트 색상 옵션
    const highlightColors = [
        { name: "노란색", value: "#FFEB3B" },
        { name: "초록색", value: "#CDDC39" },
        { name: "파란색", value: "#90CAF9" },
        { name: "분홍색", value: "#F48FB1" },
    ];

    // 하이라이트 추가 핸들러
    const handleAddHighlight = (color: string) => {
        if (!selectedText) return;

        // 선택된 텍스트와 색상 정보를 onAddHighlight 함수에 전달
        onAddHighlight({
            text: selectedText.text,
            startOffset: selectedText.startOffset,
            endOffset: selectedText.endOffset,
            color, // 선택한 색상
            pageNumber,
            blockId: selectedText.blockId || undefined,
            blockType: selectedText.blockType || undefined,
        });

        // 선택 초기화 및 Context Menu 닫기
        window.getSelection()?.removeAllRanges();
        setSelectedText(null);

        // Context Menu를 강제로 닫기 위해 Esc 키 이벤트 발생
        const escEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(escEvent);
    };

    // 선택된 텍스트 표시 (최대 30자)
    const getDisplayText = (text: string) => {
        if (text.length <= 30) return text;
        return text.substring(0, 27) + "...";
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger ref={containerRef} className="w-full h-full">
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                {selectedText ? (
                    <>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger className="flex items-center">
                                <span className="mr-2">🖌️</span>
                                <span>하이라이트 추가</span>
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                                <div className="px-2 py-1 text-xs text-gray-500 truncate">
                                    "{getDisplayText(selectedText.text)}"
                                </div>
                                <ContextMenuSeparator />
                                <div className="grid grid-cols-4 gap-2 p-2">
                                    {highlightColors.map((color) => (
                                        <button
                                            key={color.value}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color.value }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleAddHighlight(color.value);
                                            }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                window.getSelection()?.removeAllRanges();
                                setSelectedText(null);
                            }}
                            className="flex items-center"
                        >
                            <span className="mr-2">❌</span>
                            <span>선택 취소</span>
                        </ContextMenuItem>
                    </>
                ) : (
                    <ContextMenuItem disabled className="text-center">
                        텍스트를 선택해주세요
                    </ContextMenuItem>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
} 