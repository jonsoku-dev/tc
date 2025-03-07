import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/ebook-reader-page.page";
import { EbookPageViewer } from "../components/ebook-page-viewer";
import type { Highlight, BookmarkItem, PageContentType } from "../components/types";

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
            page_count: 5,
            // 페이지 기반 데이터 구조로 변경
            pages: [
                {
                    page_id: "page-1",
                    ebook_id: params.ebookId,
                    page_number: 1,
                    title: "1장: 마크다운 기초",
                    content_type: "text" as PageContentType,
                    content: {
                        content: `
# 마크다운으로 배우는 프로그래밍

## 1장: 마크다운 기초

마크다운은 텍스트 기반의 마크업 언어로, 쉽게 읽고 쓸 수 있으며 HTML로 변환이 가능합니다.

### 기본 문법

- **굵게**: \`**텍스트**\`
- *기울임*: \`*텍스트*\`
- ~~취소선~~: \`~~텍스트~~\`
                        `
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    page_id: "page-2",
                    ebook_id: params.ebookId,
                    page_number: 2,
                    title: "2장: 코드 블록 사용하기",
                    content_type: "text" as PageContentType,
                    content: {
                        content: `
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
                        `
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    page_id: "page-3",
                    ebook_id: params.ebookId,
                    page_number: 3,
                    title: "3장: 표 만들기",
                    content_type: "table" as PageContentType,
                    content: {
                        caption: "프로그래밍 언어 비교",
                        headers: ["이름", "설명", "용도"],
                        rows: [
                            ["마크다운", "텍스트 기반 마크업 언어", "문서 작성"],
                            ["HTML", "웹 페이지 구조화 언어", "웹 페이지 구조"],
                            ["CSS", "웹 페이지 스타일링 언어", "웹 페이지 디자인"],
                            ["JavaScript", "웹 페이지 동적 기능 언어", "웹 페이지 기능"]
                        ]
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    page_id: "page-4",
                    ebook_id: params.ebookId,
                    page_number: 4,
                    title: "4장: 링크와 이미지",
                    content_type: "mixed" as PageContentType,
                    content: {
                        blocks: [
                            {
                                type: "text" as PageContentType,
                                content: {
                                    content: `
## 4장: 링크와 이미지

### 링크

[마크다운 가이드](https://www.markdownguide.org/)
                                    `
                                }
                            },
                            {
                                type: "image" as PageContentType,
                                content: {
                                    url: "https://markdown-here.com/img/icon256.png",
                                    alt: "마크다운 로고",
                                    caption: "마크다운 로고 이미지"
                                }
                            }
                        ]
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    page_id: "page-5",
                    ebook_id: params.ebookId,
                    page_number: 5,
                    title: "5장: 확장 문법",
                    content_type: "text" as PageContentType,
                    content: {
                        content: `
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
                        `
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            ],
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
                pageNumber: 1,
            },
        ],
        bookmarks: [
            {
                id: "1",
                position: 0,
                title: "코드 블록 부분",
                createdAt: new Date("2023-06-20T10:15:00Z"),
                pageNumber: 2,
            },
        ],
        currentPage: 1,
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
    const { ebook, highlights: initialHighlights, bookmarks: initialBookmarks, currentPage } = loaderData;

    const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks);

    // 하이라이트 추가
    const handleAddHighlight = (highlight: Omit<Highlight, "id" | "createdAt">) => {
        const newHighlight: Highlight = {
            ...highlight,
            id: `highlight-${Date.now()}`,
            createdAt: new Date(),
        };
        setHighlights([...highlights, newHighlight]);
    };

    // 북마크 추가
    const handleAddBookmark = (bookmark: Omit<BookmarkItem, "id" | "createdAt">) => {
        const newBookmark: BookmarkItem = {
            ...bookmark,
            id: `bookmark-${Date.now()}`,
            createdAt: new Date(),
        };
        setBookmarks([...bookmarks, newBookmark]);
    };

    // 하이라이트 삭제
    const handleDeleteHighlight = (highlightId: string) => {
        setHighlights(highlights.filter(h => h.id !== highlightId));
    };

    // 북마크 삭제
    const handleDeleteBookmark = (bookmarkId: string) => {
        setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    };

    // 하이라이트 노트 업데이트
    const handleUpdateHighlightNote = (highlightId: string, note: string) => {
        setHighlights(highlights.map(h =>
            h.id === highlightId ? { ...h, note } : h
        ));
    };

    // 페이지 변경 처리
    const handlePageChange = (pageNumber: number) => {
        console.log(`페이지 변경: ${pageNumber}`);
        // 여기서 필요한 경우 서버에 읽기 진행 상태를 업데이트할 수 있습니다.
    };

    return (
        <EbookPageViewer
            ebook={ebook}
            initialPage={currentPage}
            highlights={highlights}
            bookmarks={bookmarks}
            onAddHighlight={handleAddHighlight}
            onAddBookmark={handleAddBookmark}
            onDeleteHighlight={handleDeleteHighlight}
            onDeleteBookmark={handleDeleteBookmark}
            onUpdateHighlightNote={handleUpdateHighlightNote}
            onPageChange={handlePageChange}
        />
    );
} 