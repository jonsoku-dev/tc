import { setup, assign } from "xstate";
import type { Highlight, BookmarkItem } from "../components/types";

// 전자책 리더 상태 인터페이스
export interface EbookReaderContext {
    currentPage: number;
    highlights: Highlight[];
    bookmarks: BookmarkItem[];
    activeItemId: string | null;
    maxPage?: number;
}

// 전자책 리더 머신 입력 타입
export interface EbookReaderInput {
    currentPage?: number;
    highlights?: Highlight[];
    bookmarks?: BookmarkItem[];
    maxPage?: number;
}

// 전자책 리더 이벤트 타입
export type EbookReaderEvent =
    | { type: "NEXT_PAGE" }
    | { type: "PREV_PAGE" }
    | { type: "JUMP_TO_PAGE"; pageNumber: number }
    | { type: "ADD_HIGHLIGHT"; highlight: Omit<Highlight, "id" | "createdAt"> }
    | { type: "DELETE_HIGHLIGHT"; highlightId: string }
    | { type: "UPDATE_HIGHLIGHT_NOTE"; highlightId: string; note: string }
    | { type: "ADD_BOOKMARK"; bookmark: Omit<BookmarkItem, "id" | "createdAt"> }
    | { type: "DELETE_BOOKMARK"; bookmarkId: string }
    | { type: "SET_ACTIVE_ITEM"; itemId: string | null };

// 디버깅 함수
const logAction = (name: string) => (context: any, event: any) => {
    console.log(`액션 실행: ${name}`, { context, event });
};

// 전자책 리더 머신 생성 함수
export const createEbookReaderMachine = setup({
    types: {
        context: {} as EbookReaderContext,
        events: {} as EbookReaderEvent,
        input: {} as EbookReaderInput,
    },
    actions: {
        logNextPage: logAction("goToNextPage"),
        logPrevPage: logAction("goToPrevPage"),
        logJumpToPage: logAction("jumpToPage"),
        logAddHighlight: logAction("addHighlight"),
        logDeleteHighlight: logAction("deleteHighlight"),
        logUpdateHighlightNote: logAction("updateHighlightNote"),
        logAddBookmark: logAction("addBookmark"),
        logDeleteBookmark: logAction("deleteBookmark"),
        logSetActiveItem: logAction("setActiveItem"),

        goToNextPage: assign(({ context }) => {
            const newPage = Math.min(context.currentPage + 1, context.maxPage || Number.MAX_SAFE_INTEGER);
            console.log(`페이지 변경: ${context.currentPage} -> ${newPage}`);
            return { currentPage: newPage };
        }),

        goToPrevPage: assign(({ context }) => {
            const newPage = Math.max(1, context.currentPage - 1);
            console.log(`페이지 변경: ${context.currentPage} -> ${newPage}`);
            return { currentPage: newPage };
        }),

        jumpToPage: assign(({ context, event }) => {
            if (event.type !== "JUMP_TO_PAGE") return {};
            const maxPage = context.maxPage || Number.MAX_SAFE_INTEGER;
            const newPage = Math.min(Math.max(1, event.pageNumber), maxPage);
            console.log(`페이지 점프: ${context.currentPage} -> ${newPage}`);
            return { currentPage: newPage };
        }),

        addHighlight: assign(({ context, event }) => {
            if (event.type !== "ADD_HIGHLIGHT") return {};

            const newHighlight: Highlight = {
                ...event.highlight,
                id: `highlight-${Date.now()}`,
                createdAt: new Date(),
            };

            console.log("하이라이트 추가:", newHighlight);
            return {
                highlights: [...context.highlights, newHighlight]
            };
        }),

        deleteHighlight: assign(({ context, event }) => {
            if (event.type !== "DELETE_HIGHLIGHT") return {};

            console.log("하이라이트 삭제:", event.highlightId);
            return {
                highlights: context.highlights.filter((h) => h.id !== event.highlightId)
            };
        }),

        updateHighlightNote: assign(({ context, event }) => {
            if (event.type !== "UPDATE_HIGHLIGHT_NOTE") return {};

            console.log("하이라이트 노트 업데이트:", { highlightId: event.highlightId, note: event.note });
            return {
                highlights: context.highlights.map((h) =>
                    h.id === event.highlightId ? { ...h, note: event.note } : h
                )
            };
        }),

        addBookmark: assign(({ context, event }) => {
            if (event.type !== "ADD_BOOKMARK") return {};

            const newBookmark: BookmarkItem = {
                ...event.bookmark,
                id: `bookmark-${Date.now()}`,
                createdAt: new Date(),
            };

            console.log("북마크 추가:", newBookmark);
            return {
                bookmarks: [...context.bookmarks, newBookmark]
            };
        }),

        deleteBookmark: assign(({ context, event }) => {
            if (event.type !== "DELETE_BOOKMARK") return {};

            console.log("북마크 삭제:", event.bookmarkId);
            return {
                bookmarks: context.bookmarks.filter((b) => b.id !== event.bookmarkId)
            };
        }),

        setActiveItem: assign(({ event }) => {
            if (event.type !== "SET_ACTIVE_ITEM") return {};

            console.log("활성 아이템 설정:", event.itemId);
            return {
                activeItemId: event.itemId
            };
        }),
    },
}).createMachine({
    id: "ebookReader",
    context: ({ input }) => ({
        currentPage: input?.currentPage || 1,
        highlights: input?.highlights || [],
        bookmarks: input?.bookmarks || [],
        activeItemId: null,
        maxPage: input?.maxPage,
    }),
    initial: "reading",
    states: {
        reading: {
            on: {
                NEXT_PAGE: {
                    actions: ["logNextPage", "goToNextPage"],
                },
                PREV_PAGE: {
                    actions: ["logPrevPage", "goToPrevPage"],
                },
                JUMP_TO_PAGE: {
                    actions: ["logJumpToPage", "jumpToPage"],
                },
                ADD_HIGHLIGHT: {
                    actions: ["logAddHighlight", "addHighlight"],
                },
                DELETE_HIGHLIGHT: {
                    actions: ["logDeleteHighlight", "deleteHighlight"],
                },
                UPDATE_HIGHLIGHT_NOTE: {
                    actions: ["logUpdateHighlightNote", "updateHighlightNote"],
                },
                ADD_BOOKMARK: {
                    actions: ["logAddBookmark", "addBookmark"],
                },
                DELETE_BOOKMARK: {
                    actions: ["logDeleteBookmark", "deleteBookmark"],
                },
                SET_ACTIVE_ITEM: {
                    actions: ["logSetActiveItem", "setActiveItem"],
                },
            },
        },
    },
}); 