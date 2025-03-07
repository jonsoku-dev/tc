import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { ArrowLeft, Edit, Download, ShoppingCart, Calendar, Clock, Book, Globe, Hash } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EbookCover } from "../components/ebook-cover";
import { TableOfContents } from "../components/table-of-contents";
import { ReviewList } from "../components/review-list";
import { ReviewForm } from "../components/review-form";
import { ReadingProgress } from "../components/reading-progress";
import { BookmarkList } from "../components/bookmark-list";
import { HighlightList } from "../components/highlight-list";
import type { Route } from "./+types/ebook-detail-page.page";

export function loader({ params }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 전자책 정보를 가져옵니다.
    return {
        ebook: {
            ebook_id: params.ebookId,
            title: "마크다운으로 배우는 프로그래밍",
            description: "마크다운을 활용한 프로그래밍 학습 가이드입니다. 이 책은 마크다운의 기본 문법부터 고급 활용법까지 다양한 내용을 다루고 있습니다.",
            ebook_status: "published",
            price: "15000",
            cover_image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
            publication_date: "2023-05-15T00:00:00Z",
            reading_time: 180,
            page_count: 250,
            language: "ko",
            is_featured: true,
            isbn: "979-11-5839-142-9",
            table_of_contents: [
                "1장: 마크다운 기초",
                "2장: 코드 블록 사용하기",
                "3장: 표 만들기",
                "4장: 링크와 이미지",
                "5장: 확장 문법",
            ],
            sample_content: `
# 마크다운 샘플

이 문서는 마크다운의 기본 문법을 보여주는 샘플입니다.

## 기본 문법

- **굵게**: \`**텍스트**\`
- *기울임*: \`*텍스트*\`
- ~~취소선~~: \`~~텍스트~~\`

## 코드 블록

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`
            `,
            content: `
# 마크다운으로 배우는 프로그래밍

## 1장: 마크다운 기초

마크다운은 텍스트 기반의 마크업 언어로, 쉽게 읽고 쓸 수 있으며 HTML로 변환이 가능합니다.

### 기본 문법

- **굵게**: \`**텍스트**\`
- *기울임*: \`*텍스트*\`
- ~~취소선~~: \`~~텍스트~~\`

## 2장: 코드 블록 사용하기

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

## 3장: 표 만들기

| 이름 | 설명 |
|------|------|
| 마크다운 | 텍스트 기반 마크업 언어 |
| HTML | 웹 페이지 구조화 언어 |
      `,
        },
        reviews: [
            {
                review_id: "1",
                user_id: "user1",
                ebook_id: params.ebookId,
                rating: 5,
                comment: "정말 유익한 책입니다. 마크다운을 처음 배우는 사람에게 강력 추천합니다!",
                created_at: "2023-06-10T09:30:00Z",
                updated_at: "2023-06-10T09:30:00Z",
                user: {
                    name: "김철수",
                    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kim",
                },
            },
            {
                review_id: "2",
                user_id: "user2",
                ebook_id: params.ebookId,
                rating: 4,
                comment: "전반적으로 좋은 내용이지만, 고급 기능에 대한 설명이 조금 부족합니다.",
                created_at: "2023-06-15T14:20:00Z",
                updated_at: "2023-06-15T14:20:00Z",
                user: {
                    name: "이영희",
                    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lee",
                },
            },
        ],
        reading_progress: {
            current_page: 120,
            progress_percentage: 48,
            last_read_at: "2023-07-01T18:45:00Z",
            is_completed: false,
        },
        bookmarks: [
            {
                bookmark_id: "1",
                user_id: "current_user",
                ebook_id: params.ebookId,
                page_number: 25,
                created_at: "2023-06-20T10:15:00Z",
            },
            {
                bookmark_id: "2",
                user_id: "current_user",
                ebook_id: params.ebookId,
                page_number: 78,
                created_at: "2023-06-25T16:30:00Z",
            },
        ],
        highlights: [
            {
                highlight_id: "1",
                user_id: "current_user",
                ebook_id: params.ebookId,
                start_position: 150,
                end_position: 200,
                color: "#FFEB3B",
                note: "마크다운의 핵심 개념",
                created_at: "2023-06-22T11:20:00Z",
                updated_at: "2023-06-22T11:20:00Z",
                text: "마크다운은 텍스트 기반의 마크업 언어로, 쉽게 읽고 쓸 수 있으며 HTML로 변환이 가능합니다.",
            },
        ],
        current_user_id: "current_user",
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: data.ebook.title },
        { name: "description", content: data.ebook.description },
    ];
}

// 마크다운 렌더링 함수 추가
function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 코드 블록 스타일링
                    code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return !className?.includes('language-') ? (
                            <code className={`bg-gray-100 px-1 py-0.5 rounded ${className}`} {...rest}>
                                {children}
                            </code>
                        ) : (
                            <pre className={`bg-gray-100 p-4 rounded-md overflow-auto ${className}`}>
                                <code className={className} {...rest}>
                                    {children}
                                </code>
                            </pre>
                        );
                    },
                    // 테이블 스타일링
                    table(props) {
                        const { children, ...rest } = props;
                        return (
                            <div className="overflow-x-auto">
                                <table className="border-collapse border border-gray-300 w-full" {...rest}>
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    th(props) {
                        const { children, ...rest } = props;
                        return (
                            <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left" {...rest}>
                                {children}
                            </th>
                        );
                    },
                    td(props) {
                        const { children, ...rest } = props;
                        return (
                            <td className="border border-gray-300 px-4 py-2" {...rest}>
                                {children}
                            </td>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

export default function EbookDetailPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { ebook, reviews, reading_progress, bookmarks, highlights, current_user_id } = loaderData;
    const [activeTab, setActiveTab] = useState("preview");
    const [showReviewForm, setShowReviewForm] = useState(false);

    const statusColors = {
        published: "bg-green-100 text-green-800",
        draft: "bg-yellow-100 text-yellow-800",
        archived: "bg-gray-100 text-gray-800",
    };

    const handleReviewSubmit = (data: { rating: number; comment: string }) => {
        // 실제 구현에서는 Supabase에 리뷰를 저장합니다.
        console.log("리뷰 제출:", data);
        setShowReviewForm(false);
        // 성공 후 리뷰 목록 새로고침
    };

    const handleProgressUpdate = (data: {
        current_page: number;
        progress_percentage: number;
        is_completed: boolean;
    }) => {
        // 실제 구현에서는 Supabase에 진행률을 업데이트합니다.
        console.log("진행률 업데이트:", data);
    };

    const handleBookmarkDelete = (bookmarkId: string) => {
        // 실제 구현에서는 Supabase에서 북마크를 삭제합니다.
        console.log("북마크 삭제:", bookmarkId);
    };

    const handleHighlightDelete = (highlightId: string) => {
        // 실제 구현에서는 Supabase에서 하이라이트를 삭제합니다.
        console.log("하이라이트 삭제:", highlightId);
    };

    const handleHighlightNoteUpdate = (highlightId: string, note: string) => {
        // 실제 구현에서는 Supabase에서 하이라이트 노트를 업데이트합니다.
        console.log("하이라이트 노트 업데이트:", highlightId, note);
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/ebooks")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                전자책 목록으로 돌아가기
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* 헤더 섹션 */}
                    <Card className="mb-8">
                        <CardHeader className="pb-0">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 lg:w-1/4">
                                    <EbookCover
                                        imageUrl={ebook.cover_image_url}
                                        alt={ebook.title}
                                        className="w-full aspect-[2/3] rounded-md shadow-md"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-3xl">{ebook.title}</CardTitle>
                                            <CardDescription className="mt-2">{ebook.description}</CardDescription>
                                        </div>
                                        <Badge className={statusColors[ebook.ebook_status as keyof typeof statusColors]}>
                                            {ebook.ebook_status === "published" ? "출판됨" :
                                                ebook.ebook_status === "draft" ? "초안" : "보관됨"}
                                        </Badge>
                                    </div>

                                    {/* 메타데이터 */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>
                                                출판일: {format(new Date(ebook.publication_date), "yyyy년 MM월 dd일", { locale: ko })}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span>
                                                읽기 시간: 약 {Math.floor(ebook.reading_time / 60)}시간 {ebook.reading_time % 60}분
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Book className="h-4 w-4 mr-2" />
                                            <span>페이지: {ebook.page_count}쪽</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Globe className="h-4 w-4 mr-2" />
                                            <span>
                                                언어: {ebook.language === "ko" ? "한국어" :
                                                    ebook.language === "en" ? "영어" :
                                                        ebook.language === "ja" ? "일본어" : ebook.language}
                                            </span>
                                        </div>
                                        {ebook.isbn && (
                                            <div className="flex items-center text-sm text-gray-500 col-span-2">
                                                <Hash className="h-4 w-4 mr-2" />
                                                <span>ISBN: {ebook.isbn}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* 목차 */}
                    <TableOfContents
                        items={ebook.table_of_contents}
                        className="mb-8"
                    />

                    {/* 콘텐츠 섹션 */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>콘텐츠</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="preview">미리보기</TabsTrigger>
                                    <TabsTrigger value="source">소스</TabsTrigger>
                                </TabsList>
                                <TabsContent value="preview" className="min-h-[500px]">
                                    <MarkdownRenderer content={ebook.content} />
                                </TabsContent>
                                <TabsContent value="source" className="min-h-[500px]">
                                    <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
                                        {ebook.content}
                                    </pre>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* 리뷰 섹션 */}
                    <div className="space-y-6">
                        <ReviewList
                            reviews={reviews}
                            currentUserId={current_user_id}
                        />

                        {!showReviewForm ? (
                            <Button onClick={() => setShowReviewForm(true)}>
                                리뷰 작성하기
                            </Button>
                        ) : (
                            <ReviewForm
                                ebookId={ebook.ebook_id}
                                onSubmit={handleReviewSubmit}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* 구매 정보 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>구매 정보</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold mb-4">{Number(ebook.price).toLocaleString()}원</p>
                            <div className="space-y-4">
                                <Button className="w-full" asChild>
                                    <Link to={`/ebooks/${ebook.ebook_id}/read`}>
                                        <Book className="mr-2 h-4 w-4" />
                                        읽기
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    장바구니에 추가
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    샘플 다운로드
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 독서 진행률 */}
                    <ReadingProgress
                        ebookId={ebook.ebook_id}
                        userId={current_user_id}
                        pageCount={ebook.page_count}
                        progress={reading_progress}
                        onProgressUpdate={handleProgressUpdate}
                    />

                    {/* 북마크 */}
                    <BookmarkList
                        bookmarks={bookmarks}
                        currentUserId={current_user_id}
                        onBookmarkDelete={handleBookmarkDelete}
                    />

                    {/* 하이라이트 */}
                    <HighlightList
                        highlights={highlights}
                        currentUserId={current_user_id}
                        onHighlightDelete={handleHighlightDelete}
                        onNoteUpdate={handleHighlightNoteUpdate}
                    />

                    {/* 관리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>관리</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" asChild>
                                <a href={`/ebooks/${ebook.ebook_id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    편집하기
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 