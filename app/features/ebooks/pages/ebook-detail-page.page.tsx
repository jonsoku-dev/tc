import { useNavigate, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getServerClient } from "~/server";
import type { Route } from "./+types/ebook-detail-page.page";
import {
    EbookHeaderCard,
    PurchaseInfoCard,
    ManagementCard,
    ReadingProgressCard,
    BookmarkCard,
    HighlightCard,
    ReviewCard,
    ContentPreviewCard,
    TableOfContentsCard
} from "../components/detail";

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

    // 카테고리 정보 가져오기
    const { data: categories, error: categoriesError } = await supabase
        .from("ebook_categories")
        .select("*, categories(name)")
        .eq("ebook_id", params.ebookId);

    // 평균 평점 계산
    const { data: avgRatingData } = await supabase
        .from("reviews")
        .select("rating")
        .eq("ebook_id", params.ebookId)
        .then(result => {
            if (result.error || !result.data || result.data.length === 0) return { data: { avgRating: 0, count: 0 } };
            const sum = result.data.reduce((acc, review) => acc + (review.rating || 0), 0);
            return { data: { avgRating: sum / result.data.length, count: result.data.length } };
        });

    return {
        ebook,
        pages: pages || [],
        progress: progress || null,
        bookmarks: bookmarks || [],
        highlights: highlights || [],
        categories: categories || [],
        avgRating: avgRatingData.avgRating || 0,
        reviewCount: avgRatingData.count || 0,
        userId: user.id
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: data.ebook.title },
        { name: "description", content: data.ebook.description },
    ];
}

export default function EbookDetailPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { ebook, pages, progress, bookmarks, highlights, categories, avgRating, reviewCount, userId } = loaderData;

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

        // 샘플 콘텐츠 사용
        const sampleContent = ebook.sample_content;
        return sampleContent ? String(sampleContent) : "";
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
        return highlights?.map(highlight => ({
            ...highlight,
            createdAt: new Date(highlight.created_at).toISOString(),
        })) || [];
    };

    const handleBookmarkDelete = (bookmarkId: string) => {
        // 북마크 삭제 로직
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

    const handleEbookDelete = (ebookId: string) => {
        // 실제 구현에서는 Supabase에서 전자책을 삭제합니다.
        console.log("전자책 삭제:", ebookId);
        // 삭제 후 목록 페이지로 리디렉션
        navigate("/ebooks");
    };

    const handleEbookArchive = (ebookId: string) => {
        // 실제 구현에서는 Supabase에서 전자책 상태를 보관으로 변경합니다.
        console.log("전자책 보관:", ebookId);
    };

    // 포맷된 데이터
    const formattedProgress = formatProgress(progress);
    const formattedBookmarks = formatBookmarks(bookmarks);
    const formattedHighlights = formatHighlights(highlights);
    const ebookContent = getPageContent();

    // 카테고리 이름 추출
    const categoryNames = categories
        .map((cat: any) => cat.categories?.name)
        .filter(Boolean);

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
                    <EbookHeaderCard
                        ebook={{
                            ...ebook,
                            description: ebook.description || "",
                        }}
                        avgRating={avgRating}
                        reviewCount={reviewCount}
                        categoryNames={categoryNames}
                        className="mb-8"
                    />

                    {/* 목차 */}
                    <TableOfContentsCard
                        items={tableOfContents}
                        className="mb-8"
                    />

                    {/* 콘텐츠 섹션 */}
                    <ContentPreviewCard
                        content={ebookContent}
                        className="mb-8"
                    />

                    {/* 리뷰 섹션 */}
                    <ReviewCard
                        ebookId={ebook.ebook_id}
                        currentUserId={userId}
                        className="mb-8"
                    />
                </div>

                <div className="space-y-8">
                    {/* 구매 정보 */}
                    <PurchaseInfoCard
                        ebookId={ebook.ebook_id}
                        price={ebook.price}
                    />

                    {/* 독서 진행률 */}
                    <ReadingProgressCard
                        ebookId={ebook.ebook_id}
                        userId={userId}
                        pageCount={pageCount}
                        progress={formattedProgress}
                    />

                    {/* 북마크 */}
                    <BookmarkCard
                        bookmarks={formattedBookmarks}
                        currentUserId={userId}
                        onBookmarkDelete={handleBookmarkDelete}
                        onBookmarkClick={(pageNumber) => console.log("북마크 페이지로 이동:", pageNumber)}
                    />

                    {/* 하이라이트 */}
                    <HighlightCard
                        highlights={formattedHighlights}
                        currentUserId={userId}
                        onHighlightDelete={handleHighlightDelete}
                        onNoteUpdate={handleHighlightNoteUpdate}
                        onHighlightClick={(start, end) => console.log("하이라이트 위치로 이동:", start, end)}
                    />

                    {/* 관리 */}
                    <ManagementCard
                        ebookId={ebook.ebook_id}
                        ebookStatus={ebook.ebook_status}
                        onDelete={handleEbookDelete}
                        onArchive={handleEbookArchive}
                    />
                </div>
            </div>
        </div>
    );
} 