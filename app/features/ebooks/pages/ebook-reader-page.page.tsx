import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { EbookReaderSidebar } from "../components/ebook-reader-sidebar";
import { EbookReaderToolbar } from "../components/ebook-reader-toolbar";
import { MarkdownRenderer } from "../components/markdown-renderer";
import { PageNavigation } from "../components/page-navigation";
import type { BookmarkItem, Highlight, TocItem } from "../components/types";
import type { Route } from "./+types/ebook-reader-page.page";

// 로더 함수
export function loader({ params }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 전자책 정보를 가져옵니다.
    return {
        ebook: {
            ebook_id: params.ebookId,
            title: "마크다운으로 배우는 프로그래밍",
            description: "마크다운을 활용한 프로그래밍 학습 가이드입니다.",
            cover_image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
            table_of_contents: [
                "1장: 마크다운 기초",
                "2장: 코드 블록 사용하기",
                "3장: 표 만들기",
                "4장: 링크와 이미지",
                "5장: 확장 문법",
            ],
            content: `
# 마크다운으로 배우는 프로그래밍

## 1장: 마크다운 기초

마크다운은 텍스트 기반의 마크업 언어로, 쉽게 읽고 쓸 수 있으며 HTML로 변환이 가능합니다.

### 기본 문법

- **굵게**: \`**텍스트**\`
- *기울임*: \`*텍스트*\`
- ~~취소선~~: \`~~텍스트~~\`

## 2장: 코드 블록 사용하기

코드 블록은 프로그래밍 코드를 표현하는 데 매우 유용합니다.

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

\`\`\`typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User) {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

## 3장: 표 만들기

표는 데이터를 정리하여 보여주는 데 효과적입니다.

| 이름 | 설명 |
|------|------|
| 마크다운 | 텍스트 기반 마크업 언어 |
| HTML | 웹 페이지 구조화 언어 |
| CSS | 웹 페이지 스타일링 언어 |
| JavaScript | 웹 페이지 동적 기능 언어 |

## 4장: 링크와 이미지

### 링크

[마크다운 가이드](https://www.markdownguide.org/)

### 이미지

![마크다운 로고](https://markdown-here.com/img/icon256.png)

## 5장: 확장 문법

마크다운의 확장 문법에는 다양한 기능이 있습니다.

### 각주

여기에 각주[^1]가 있습니다.

[^1]: 이것은 각주입니다.

### 정의 목록

마크다운
: 텍스트 기반의 마크업 언어

HTML
: 웹 페이지를 구조화하는 언어
      `,
        },
        highlights: [
            {
                id: "1",
                text: "마크다운은 텍스트 기반의 마크업 언어로",
                startOffset: 100,
                endOffset: 120,
                color: "#FFEB3B",
                note: "마크다운의 핵심 개념",
                createdAt: new Date("2023-06-22T11:20:00Z"),
            },
        ],
        bookmarks: [
            {
                id: "1",
                position: 500,
                title: "코드 블록 부분",
                createdAt: new Date("2023-06-20T10:15:00Z"),
            },
        ],
        currentPosition: 0,
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: `${data.ebook.title} - 읽기` },
        { name: "description", content: data.ebook.description },
    ];
}

// 메인 컴포넌트
export default function EbookReaderPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { ebook, highlights: initialHighlights, bookmarks: initialBookmarks, currentPosition } = loaderData;

    // 상태 관리
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(16);
    const [lineHeight, setLineHeight] = useState(1.6);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(10); // 예시 값

    const contentRef = useRef<HTMLDivElement>(null);

    // 목차 아이템 생성
    const tocItems: TocItem[] = ebook.table_of_contents.map((title: string, index: number) => ({
        id: `toc-${index}`,
        title,
        level: 1,
        position: index * 500, // 예시 값, 실제로는 콘텐츠 내 위치 계산 필요
    }));

    // 스크롤 이벤트 처리
    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) return;

            const scrollPosition = contentRef.current.scrollTop;

            // 현재 스크롤 위치에 따라 활성 목차 아이템 업데이트
            const activeItem = tocItems.reduce((prev, current) => {
                return (Math.abs(current.position - scrollPosition) < Math.abs(prev.position - scrollPosition))
                    ? current
                    : prev;
            });

            setActiveItemId(activeItem.id);

            // 현재 페이지 계산 (예시)
            const scrollPercentage = scrollPosition / (contentRef.current.scrollHeight - contentRef.current.clientHeight);
            const currentPage = Math.max(1, Math.ceil(scrollPercentage * totalPages));
            setCurrentPage(currentPage);
        };

        const contentElement = contentRef.current;
        if (contentElement) {
            contentElement.addEventListener("scroll", handleScroll);
            return () => contentElement.removeEventListener("scroll", handleScroll);
        }
    }, [tocItems, totalPages]);

    // 텍스트 선택 처리
    const handleTextSelect = ({ text, startOffset, endOffset }: { text: string; startOffset: number; endOffset: number }) => {
        if (!text) return;

        const newHighlight: Highlight = {
            id: `highlight-${Date.now()}`,
            text,
            startOffset,
            endOffset,
            color: "#FFEB3B", // 기본 색상
            createdAt: new Date(),
        };

        setHighlights([...highlights, newHighlight]);
    };

    // 북마크 추가
    const addBookmark = () => {
        if (!contentRef.current) return;

        const scrollPosition = contentRef.current.scrollTop;

        // 현재 위치에 가장 가까운 목차 아이템 찾기
        const nearestTocItem = tocItems.reduce((prev, current) => {
            return (Math.abs(current.position - scrollPosition) < Math.abs(prev.position - scrollPosition))
                ? current
                : prev;
        });

        const newBookmark: BookmarkItem = {
            id: `bookmark-${Date.now()}`,
            position: scrollPosition,
            title: nearestTocItem.title,
            createdAt: new Date(),
        };

        setBookmarks([...bookmarks, newBookmark]);
    };

    // 목차 아이템 클릭 처리
    const handleTocItemClick = (item: TocItem) => {
        if (!contentRef.current) return;

        contentRef.current.scrollTo({
            top: item.position,
            behavior: "smooth",
        });

        setActiveItemId(item.id);
    };

    // 북마크 클릭 처리
    const handleBookmarkClick = (bookmark: BookmarkItem) => {
        if (!contentRef.current) return;

        contentRef.current.scrollTo({
            top: bookmark.position,
            behavior: "smooth",
        });
    };

    // 하이라이트 클릭 처리
    const handleHighlightClick = (highlight: Highlight) => {
        if (!contentRef.current) return;

        // 실제 구현에서는 하이라이트 위치로 스크롤
        contentRef.current.scrollTo({
            top: highlight.startOffset,
            behavior: "smooth",
        });
    };

    // 북마크 삭제
    const handleBookmarkDelete = (bookmarkId: string) => {
        setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    };

    // 하이라이트 삭제
    const handleHighlightDelete = (highlightId: string) => {
        setHighlights(highlights.filter(h => h.id !== highlightId));
    };

    // 하이라이트 노트 업데이트
    const handleHighlightNoteUpdate = (highlightId: string, note: string) => {
        setHighlights(highlights.map(h =>
            h.id === highlightId ? { ...h, note } : h
        ));
    };

    // 페이지 이동
    const goToNextPage = () => {
        if (!contentRef.current) return;

        // 간단한 구현을 위해 스크롤 위치를 조정
        contentRef.current.scrollBy({
            top: contentRef.current.clientHeight * 0.9,
            behavior: "smooth",
        });
    };

    const goToPrevPage = () => {
        if (!contentRef.current) return;

        contentRef.current.scrollBy({
            top: -contentRef.current.clientHeight * 0.9,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            {/* 사이드바 */}
            {sidebarOpen && (
                <EbookReaderSidebar
                    title={ebook.title}
                    tocItems={tocItems}
                    bookmarks={bookmarks}
                    highlights={highlights}
                    activeItemId={activeItemId}
                    onClose={() => setSidebarOpen(false)}
                    onTocItemClick={handleTocItemClick}
                    onBookmarkClick={handleBookmarkClick}
                    onBookmarkDelete={handleBookmarkDelete}
                    onHighlightClick={handleHighlightClick}
                    onHighlightDelete={handleHighlightDelete}
                    onHighlightNoteUpdate={handleHighlightNoteUpdate}
                    className="sticky top-0 h-screen overflow-y-auto"
                />
            )}

            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* 상단 툴바 */}
                <EbookReaderToolbar
                    title={ebook.title}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    sidebarOpen={sidebarOpen}
                    onBackClick={() => navigate(`/ebooks/${ebook.ebook_id}`)}
                    onToggleSidebar={() => setSidebarOpen(true)}
                    onAddBookmark={addBookmark}
                    onFontSizeChange={setFontSize}
                    onLineHeightChange={setLineHeight}
                    className="sticky top-0 z-10 bg-white"
                />

                {/* 콘텐츠 영역 */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full"
                    style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                >
                    <MarkdownRenderer
                        content={ebook.content}
                        highlights={highlights}
                        onTextSelect={handleTextSelect}
                    />
                </div>

                {/* 하단 네비게이션 */}
                <PageNavigation
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrevPage={goToPrevPage}
                    onNextPage={goToNextPage}
                    className="sticky bottom-0 z-10 bg-white"
                />
            </div>
        </div>
    );
} 