import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// UI 상태 인터페이스
interface EbookUIState {
    sidebarOpen: boolean;
    fontSize: number;
    lineHeight: number;
}

// UI 컨텍스트 타입 정의
interface EbookUIContextType extends EbookUIState {
    toggleSidebar: () => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    increaseLineHeight: () => void;
    decreaseLineHeight: () => void;
}

// 기본값으로 사용할 컨텍스트 생성
const EbookUIContext = createContext<EbookUIContextType | undefined>(undefined);

// 컨텍스트 프로바이더 props 타입
interface EbookUIProviderProps {
    children: ReactNode;
    initialSidebarOpen?: boolean;
    initialFontSize?: number;
    initialLineHeight?: number;
}

// 컨텍스트 프로바이더 컴포넌트
export function EbookUIProvider({
    children,
    initialSidebarOpen = true,
    initialFontSize = 16,
    initialLineHeight = 1.6,
}: EbookUIProviderProps) {
    // UI 상태 관리
    const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
    const [fontSize, setFontSize] = useState(initialFontSize);
    const [lineHeight, setLineHeight] = useState(initialLineHeight);

    // UI 상태 변경 함수
    const toggleSidebar = React.useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const increaseFontSize = React.useCallback(() => {
        setFontSize(prev => Math.min(prev + 1, 24)); // 최대 24px
    }, []);

    const decreaseFontSize = React.useCallback(() => {
        setFontSize(prev => Math.max(prev - 1, 12)); // 최소 12px
    }, []);

    const increaseLineHeight = React.useCallback(() => {
        setLineHeight(prev => Math.min(prev + 0.1, 2.5)); // 최대 2.5
    }, []);

    const decreaseLineHeight = React.useCallback(() => {
        setLineHeight(prev => Math.max(prev - 0.1, 1.0)); // 최소 1.0
    }, []);

    // 컨텍스트 값 생성
    const contextValue = React.useMemo(() => ({
        sidebarOpen,
        fontSize,
        lineHeight,
        toggleSidebar,
        increaseFontSize,
        decreaseFontSize,
        increaseLineHeight,
        decreaseLineHeight,
    }), [
        sidebarOpen,
        fontSize,
        lineHeight,
        toggleSidebar,
        increaseFontSize,
        decreaseFontSize,
        increaseLineHeight,
        decreaseLineHeight
    ]);

    // 디버깅용 로그
    console.log("EbookUIProvider 렌더링:", { sidebarOpen, fontSize, lineHeight });

    return (
        <EbookUIContext.Provider value={contextValue}>
            {children}
        </EbookUIContext.Provider>
    );
}

// 커스텀 훅으로 컨텍스트 사용
export function useEbookUI() {
    const context = useContext(EbookUIContext);
    if (context === undefined) {
        throw new Error("useEbookUI must be used within an EbookUIProvider");
    }
    return context;
} 