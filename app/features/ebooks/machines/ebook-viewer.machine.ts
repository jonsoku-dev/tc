import { setup, assign } from "xstate";

// 전자책 뷰어 상태 인터페이스
export interface EbookViewerContext {
    currentPage: number;
    sidebarOpen: boolean;
    fontSize: number;
    lineHeight: number;
    activeItemId: string | null;
    maxPage: number;
}

// 전자책 뷰어 이벤트 타입
export type EbookViewerEvent =
    | { type: "NEXT_PAGE" }
    | { type: "PREV_PAGE" }
    | { type: "JUMP_TO_PAGE"; pageNumber: number }
    | { type: "TOGGLE_SIDEBAR" }
    | { type: "SET_ACTIVE_ITEM"; itemId: string | null }
    | { type: "INCREASE_FONT_SIZE" }
    | { type: "DECREASE_FONT_SIZE" }
    | { type: "SET_FONT_SIZE"; size: number }
    | { type: "INCREASE_LINE_HEIGHT" }
    | { type: "DECREASE_LINE_HEIGHT" }
    | { type: "SET_LINE_HEIGHT"; height: number };

// 전자책 뷰어 머신 생성 함수
export function createEbookViewerMachine(initialContext: Partial<EbookViewerContext> = {}) {
    return setup({
        types: {
            context: {} as EbookViewerContext,
            events: {} as EbookViewerEvent,
        },
        actions: {
            goToNextPage: assign(({ context }) => ({
                currentPage: Math.min(context.currentPage + 1, context.maxPage)
            })),
            goToPrevPage: assign(({ context }) => ({
                currentPage: Math.max(1, context.currentPage - 1)
            })),
            jumpToPage: assign(({ context, event }) => {
                if (event.type !== "JUMP_TO_PAGE") return {};
                return {
                    currentPage: Math.min(Math.max(1, event.pageNumber), context.maxPage)
                };
            }),
            toggleSidebar: assign(({ context }) => ({
                sidebarOpen: !context.sidebarOpen
            })),
            setActiveItem: assign(({ event }) => {
                if (event.type !== "SET_ACTIVE_ITEM") return {};
                return {
                    activeItemId: event.itemId
                };
            }),
            increaseFontSize: assign(({ context }) => ({
                fontSize: Math.min(context.fontSize + 1, 24) // 최대 폰트 크기 제한
            })),
            decreaseFontSize: assign(({ context }) => ({
                fontSize: Math.max(context.fontSize - 1, 12) // 최소 폰트 크기 제한
            })),
            setFontSize: assign(({ event }) => {
                if (event.type !== "SET_FONT_SIZE") return {};
                return {
                    fontSize: Math.min(Math.max(event.size, 12), 24) // 12~24 사이로 제한
                };
            }),
            increaseLineHeight: assign(({ context }) => ({
                lineHeight: Math.min(context.lineHeight + 0.1, 2.5) // 최대 줄 간격 제한
            })),
            decreaseLineHeight: assign(({ context }) => ({
                lineHeight: Math.max(context.lineHeight - 0.1, 1.0) // 최소 줄 간격 제한
            })),
            setLineHeight: assign(({ event }) => {
                if (event.type !== "SET_LINE_HEIGHT") return {};
                return {
                    lineHeight: Math.min(Math.max(event.height, 1.0), 2.5) // 1.0~2.5 사이로 제한
                };
            }),
        },
    }).createMachine({
        id: "ebookViewer",
        context: {
            currentPage: 1,
            sidebarOpen: true,
            fontSize: 16,
            lineHeight: 1.6,
            activeItemId: null,
            maxPage: 1,
            ...initialContext,
        },
        initial: "viewing",
        states: {
            viewing: {
                on: {
                    NEXT_PAGE: {
                        actions: "goToNextPage",
                    },
                    PREV_PAGE: {
                        actions: "goToPrevPage",
                    },
                    JUMP_TO_PAGE: {
                        actions: "jumpToPage",
                    },
                    TOGGLE_SIDEBAR: {
                        actions: "toggleSidebar",
                    },
                    SET_ACTIVE_ITEM: {
                        actions: "setActiveItem",
                    },
                    INCREASE_FONT_SIZE: {
                        actions: "increaseFontSize",
                    },
                    DECREASE_FONT_SIZE: {
                        actions: "decreaseFontSize",
                    },
                    SET_FONT_SIZE: {
                        actions: "setFontSize",
                    },
                    INCREASE_LINE_HEIGHT: {
                        actions: "increaseLineHeight",
                    },
                    DECREASE_LINE_HEIGHT: {
                        actions: "decreaseLineHeight",
                    },
                    SET_LINE_HEIGHT: {
                        actions: "setLineHeight",
                    },
                },
            },
        },
    });
} 