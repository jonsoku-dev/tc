import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// UI 상태 인터페이스
interface EbookUIState {
    sidebarOpen: boolean;
    fontSize: number;
    lineHeight: number;
    fontFamily: string;
    theme: 'light' | 'dark' | 'sepia';
    searchQuery: string;
    searchResults: SearchResult[];
    currentSearchIndex: number;
}

// 검색 결과 타입 정의
interface SearchResult {
    pageNumber: number;
    text: string;
    startOffset: number;
    endOffset: number;
}

// UI 컨텍스트 타입 정의
interface EbookUIContextType extends EbookUIState {
    toggleSidebar: () => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    increaseLineHeight: () => void;
    decreaseLineHeight: () => void;
    setFontFamily: (fontFamily: string) => void;
    setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
    setSearchQuery: (query: string) => void;
    setSearchResults: (results: SearchResult[]) => void;
    setCurrentSearchIndex: (index: number) => void;
    nextSearchResult: () => void;
    prevSearchResult: () => void;
    clearSearch: () => void;
    hasActiveSearch: boolean;
}

// 기본값으로 사용할 컨텍스트 생성
const EbookUIContext = createContext<EbookUIContextType | undefined>(undefined);

// 컨텍스트 프로바이더 props 타입
interface EbookUIProviderProps {
    children: ReactNode;
    initialSidebarOpen?: boolean;
    initialFontSize?: number;
    initialLineHeight?: number;
    initialFontFamily?: string;
    initialTheme?: 'light' | 'dark' | 'sepia';
}

// 컨텍스트 프로바이더 컴포넌트
export function EbookUIProvider({
    children,
    initialSidebarOpen = true,
    initialFontSize = 16,
    initialLineHeight = 1.6,
    initialFontFamily = 'Noto Sans KR, sans-serif',
    initialTheme = 'light',
}: EbookUIProviderProps) {
    // UI 상태 관리
    const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
    const [fontSize, setFontSize] = useState(initialFontSize);
    const [lineHeight, setLineHeight] = useState(initialLineHeight);
    const [fontFamily, setFontFamily] = useState(initialFontFamily);
    const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>(initialTheme);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

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

    const changeFontFamily = React.useCallback((newFontFamily: string) => {
        setFontFamily(newFontFamily);
    }, []);

    const changeTheme = React.useCallback((newTheme: 'light' | 'dark' | 'sepia') => {
        setTheme(newTheme);
    }, []);

    const nextSearchResult = React.useCallback(() => {
        if (searchResults.length === 0) return;
        setCurrentSearchIndex(prev => (prev + 1) % searchResults.length);
    }, [searchResults.length]);

    const prevSearchResult = React.useCallback(() => {
        if (searchResults.length === 0) return;
        setCurrentSearchIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    }, [searchResults.length]);

    const clearSearch = React.useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
        setCurrentSearchIndex(0);
    }, []);

    // 컨텍스트 값 생성
    const contextValue = React.useMemo(() => ({
        sidebarOpen,
        fontSize,
        lineHeight,
        fontFamily,
        theme,
        searchQuery,
        searchResults,
        currentSearchIndex,
        toggleSidebar,
        increaseFontSize,
        decreaseFontSize,
        increaseLineHeight,
        decreaseLineHeight,
        setFontFamily: changeFontFamily,
        setTheme: changeTheme,
        setSearchQuery,
        setSearchResults,
        setCurrentSearchIndex,
        nextSearchResult,
        prevSearchResult,
        clearSearch,
        hasActiveSearch: searchResults.length > 0
    }), [
        sidebarOpen,
        fontSize,
        lineHeight,
        fontFamily,
        theme,
        searchQuery,
        searchResults,
        currentSearchIndex,
        toggleSidebar,
        increaseFontSize,
        decreaseFontSize,
        increaseLineHeight,
        decreaseLineHeight,
        changeFontFamily,
        changeTheme,
        setSearchQuery,
        setSearchResults,
        setCurrentSearchIndex,
        nextSearchResult,
        prevSearchResult,
        clearSearch
    ]);

    // 디버깅용 로그
    console.log("EbookUIProvider 렌더링:", { sidebarOpen, fontSize, lineHeight, fontFamily, theme });

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