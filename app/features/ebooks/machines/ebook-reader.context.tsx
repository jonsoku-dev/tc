import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useMachine } from "@xstate/react";
import { createEbookReaderMachine } from "./ebook-reader.machine";
import type { Highlight, BookmarkItem } from "../components/types";

// 컨텍스트 타입 정의
interface EbookReaderContextType {
    state: {
        currentPage: number;
        highlights: Highlight[];
        bookmarks: BookmarkItem[];
        activeItemId: string | null;
    };
    send: (event: any) => void;
}

// 기본값으로 사용할 컨텍스트 생성
const EbookReaderContext = createContext<EbookReaderContextType | undefined>(undefined);

// 컨텍스트 프로바이더 props 타입
interface EbookReaderProviderProps {
    children: ReactNode;
    initialPage: number;
    initialHighlights: Highlight[];
    initialBookmarks: BookmarkItem[];
    maxPage: number;
}

// 컨텍스트 프로바이더 컴포넌트
export function EbookReaderProvider({
    children,
    initialPage,
    initialHighlights,
    initialBookmarks,
    maxPage,
}: EbookReaderProviderProps) {
    // useMachine 훅으로 상태와 send 함수 가져오기
    const [state, send] = useMachine(createEbookReaderMachine, {
        input: {
            currentPage: initialPage,
            highlights: initialHighlights,
            bookmarks: initialBookmarks,
            maxPage,
        }
    });

    // 컨텍스트 값 생성
    const contextValue = React.useMemo(() => {
        return {
            state: {
                currentPage: state.context.currentPage,
                highlights: state.context.highlights,
                bookmarks: state.context.bookmarks,
                activeItemId: state.context.activeItemId,
            },
            send,
        };
    }, [state, send]);

    return (
        <EbookReaderContext.Provider value={contextValue}>
            {children}
        </EbookReaderContext.Provider>
    );
}

// 커스텀 훅으로 컨텍스트 사용
export function useEbookReader() {
    const context = useContext(EbookReaderContext);
    if (context === undefined) {
        throw new Error("useEbookReader must be used within an EbookReaderProvider");
    }
    return context.state;
}

// 이벤트 핸들러 훅
export function useEbookReaderHandlers() {
    const context = useContext(EbookReaderContext);
    if (context === undefined) {
        throw new Error("useEbookReaderHandlers must be used within an EbookReaderProvider");
    }
    const { send } = context;

    // 메모이제이션된 핸들러 반환
    return React.useMemo(() => ({
        handleAddHighlight: (highlight: Highlight) => {
            send({ type: "ADD_HIGHLIGHT", highlight });
        },
        handleAddBookmark: (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => {
            send({ type: "ADD_BOOKMARK", bookmark });
        },
        handleDeleteHighlight: (highlightId: string) => {
            console.log("Context에서 하이라이트 삭제:", highlightId);
            send({ type: "DELETE_HIGHLIGHT", highlightId });
        },
        handleDeleteBookmark: (bookmarkId: string) => {
            send({ type: "DELETE_BOOKMARK", bookmarkId });
        },
        handleUpdateHighlightNote: (highlightId: string, note: string) => {
            send({ type: "UPDATE_HIGHLIGHT_NOTE", highlightId, note });
        },
        handlePageChange: (pageNumber: number) => {
            send({ type: "JUMP_TO_PAGE", pageNumber });
        },
        handleNextPage: () => {
            send({ type: "NEXT_PAGE" });
        },
        handlePrevPage: () => {
            send({ type: "PREV_PAGE" });
        },
        handleJumpToPage: (pageNumber: number) => {
            send({ type: "JUMP_TO_PAGE", pageNumber });
        },
        handleSetActiveItem: (itemId: string | null) => {
            send({ type: "SET_ACTIVE_ITEM", itemId });
        },
    }), [send]);
} 