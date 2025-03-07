import { useState } from "react";
import { useNavigate, Link, redirect } from "react-router";
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
import { getServerClient } from "~/server";
import type { Route } from "./+types/ebook-detail-page.page";

export async function loader({ params, request }: Route.LoaderArgs) {
    const { supabase, headers } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login", { headers });
    }

    // 전자책 정보 가져오기
    const { data: ebook, error: ebookError } = await supabase
        .from("ebooks")
        .select("*")
        .eq("ebook_id", params.ebookId)
        .single();

    if (ebookError || !ebook) {
        console.error("전자책 정보를 가져오는 중 오류가 발생했습니다:", ebookError);
        return redirect("/ebooks", { headers });
    }

    // 전자책 페이지 가져오기
    const { data: pages, error: pagesError } = await supabase
        .from("ebook_pages")
        .select("*")
        .eq("ebook_id", params.ebookId)
        .order("position", { ascending: true });

    // 리뷰 가져오기
    const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("*, profiles(name, username)")
        .eq("ebook_id", params.ebookId)
        .order("created_at", { ascending: false });

    // 읽기 진행 상태 가져오기
    const { data: progress, error: progressError } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("ebook_id", params.ebookId)
        .eq("user_id", user.id)
        .single();

    // 북마크 가져오기
    const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("ebook_id", params.ebookId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // 하이라이트 가져오기
    const { data: highlights, error: highlightsError } = await supabase
        .from("highlights")
        .select("*")
        .eq("ebook_id", params.ebookId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return {
        ebook,
        pages: pages || [],
        reviews: reviews || [],
        progress: progress || null,
        bookmarks: bookmarks || [],
        highlights: highlights || [],
        userId: user.id
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
    const { ebook, pages, reviews, progress, bookmarks, highlights, userId } = loaderData;
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
        // 실제 구현에서는 Supabase에 진행 상태를 저장합니다.
        console.log("진행 상태 업데이트:", data);
        // 성공 후 진행 상태 새로고침
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
        console.log("하이라이트 노트 업데이트:", { highlightId, note });
    };

    // 페이지 목차 생성
    const generateTableOfContents = () => {
        if (!pages || pages.length === 0) return [];

        // 페이지 위치(position)에 따라 정렬
        const sortedPages = [...pages].sort((a, b) => (a.position || 0) - (b.position || 0));
        return sortedPages.map(page => page.title || `페이지 ${page.page_number}`);
    };

    const tableOfContents = generateTableOfContents();
    const pageCount = ebook.page_count || 0;

    // 페이지 내용 처리
    const getPageContent = () => {
        if (!pages || pages.length === 0) return "";

        // 본문 페이지 찾기 (일반적으로 2번 페이지가 본문)
        const contentPage = pages.find(page => page.page_number === 2);
        if (contentPage && contentPage.blocks) {
            // 블록에서 텍스트 콘텐츠 추출
            try {
                const blocksArray = Array.isArray(contentPage.blocks) ? contentPage.blocks : [];

                // 마크다운 블록 찾기
                const markdownBlock = blocksArray.find((block: any) => block.type === 'markdown');
                if (markdownBlock && typeof markdownBlock === 'object' && 'content' in markdownBlock) {
                    return String(markdownBlock.content) || "";
                }

                // 문단 블록 찾기
                const paragraphBlock = blocksArray.find((block: any) => block.type === 'paragraph');
                if (paragraphBlock && typeof paragraphBlock === 'object' && 'content' in paragraphBlock) {
                    return String(paragraphBlock.content) || "";
                }

                // 첫 번째 블록의 콘텐츠 사용 (타입에 따라 다르게 처리)
                if (blocksArray.length > 0) {
                    const firstBlock = blocksArray[0];
                    if (firstBlock && typeof firstBlock === 'object' && 'content' in firstBlock) {
                        return String(firstBlock.content) || "";
                    }
                }
            } catch (error) {
                console.error("페이지 내용 파싱 중 오류 발생:", error);
            }
        }
        return "";
    };

    const ebookContent = getPageContent();

    // 타입 변환 함수
    const formatReviews = (reviews: any[]) => {
        return reviews.map(review => ({
            ...review,
            comment: review.comment || "",
            created_at: review.created_at || new Date().toISOString(),
            updated_at: review.updated_at || new Date().toISOString(),
            user: {
                name: review.profiles?.name || "사용자",
                username: review.profiles?.username || "",
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.profiles?.username || "User"}`
            }
        }));
    };

    const formatProgress = (progress: any) => {
        if (!progress) {
            return {
                current_page: 1,
                progress_percentage: 0,
                last_read_at: new Date().toISOString(),
                is_completed: false
            };
        }

        return {
            current_page: progress.current_page || 1,
            progress_percentage: progress.progress_percentage || 0,
            last_read_at: progress.last_read_at || new Date().toISOString(),
            is_completed: progress.is_completed || false
        };
    };

    const formatBookmarks = (bookmarks: any[]) => {
        return bookmarks.map(bookmark => ({
            ...bookmark,
            title: bookmark.title || "",
            created_at: bookmark.created_at || new Date().toISOString()
        }));
    };

    const formatHighlights = (highlights: any[]) => {
        return highlights.map(highlight => ({
            ...highlight,
            text: highlight.text || "",
            color: highlight.color || "#FFEB3B",
            note: highlight.note || "",
            created_at: highlight.created_at || new Date().toISOString(),
            updated_at: highlight.updated_at || new Date().toISOString()
        }));
    };

    // 포맷된 데이터
    const formattedReviews = formatReviews(reviews);
    const formattedProgress = formatProgress(progress);
    const formattedBookmarks = formatBookmarks(bookmarks);
    const formattedHighlights = formatHighlights(highlights);

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
                                        imageUrl={ebook.cover_image_url || undefined}
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
                                                출판일: {format(new Date(ebook.publication_date || 0), "yyyy년 MM월 dd일", { locale: ko })}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span>
                                                읽기 시간: 약 {Math.floor(ebook.reading_time || 0 / 60)}시간 {ebook.reading_time || 0 % 60}분
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
                        items={tableOfContents}
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
                                    <MarkdownRenderer content={String(ebookContent)} />
                                </TabsContent>
                                <TabsContent value="source" className="min-h-[500px]">
                                    <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
                                        {String(ebookContent)}
                                    </pre>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* 리뷰 섹션 */}
                    <div className="space-y-6">
                        <ReviewList
                            reviews={formattedReviews}
                            currentUserId={userId}
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
                        userId={userId}
                        pageCount={pageCount}
                        progress={formattedProgress}
                        onProgressUpdate={handleProgressUpdate}
                    />

                    {/* 북마크 */}
                    <BookmarkList
                        bookmarks={formattedBookmarks}
                        currentUserId={userId}
                        onBookmarkDelete={handleBookmarkDelete}
                    />

                    {/* 하이라이트 */}
                    <HighlightList
                        highlights={formattedHighlights}
                        currentUserId={userId}
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