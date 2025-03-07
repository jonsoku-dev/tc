import { useState } from "react";
import { Form, useNavigate, redirect } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { EBOOK_STATUS } from "../constants";
import { EbookCover } from "../components/ebook-cover";
import { MarkdownEditor } from "../components/markdown-editor";
import { PageEditor } from "../components/page-editor";
import type { PageItem } from "../components/page-editor";
import { getServerClient } from "~/server";
import type { Route } from "./+types/ebook-new-page.page";

export async function action({ request }: Route.ActionArgs) {
    const { supabase, headers } = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login", { headers });
    }

    const formData = await request.formData();

    // 기본 정보 추출
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
    const status = formData.get("status") as "draft" | "published" | "archived" || "draft";

    // 메타데이터 추출
    const pageCount = formData.get("pageCount") ? parseInt(formData.get("pageCount") as string, 10) : null;
    const readingTime = formData.get("readingTime") ? parseInt(formData.get("readingTime") as string, 10) : null;
    const language = formData.get("language") as string || "ko";
    const isbn = formData.get("isbn") as string || null;
    const isFeatured = formData.get("isFeatured") === "on";
    const publicationDate = formData.get("publicationDate") as string || null;

    // 콘텐츠 추출
    const sampleContent = formData.get("sampleContent") as string || "";
    const pages = formData.get("pages") ?
        JSON.parse(formData.get("pages") as string) :
        [];

    // 커버 이미지 처리 (실제 구현에서는 스토리지에 업로드)
    const coverImageUrl = formData.get("coverImageUrl") as string || null;

    // 전자책 데이터 생성
    const ebookData = {
        user_id: user.id,
        title,
        description,
        price,
        ebook_status: status,
        page_count: pages.length || 0,
        reading_time: readingTime,
        language,
        isbn,
        is_featured: isFeatured,
        publication_date: publicationDate,
        cover_image_url: coverImageUrl,
        sample_content: sampleContent
    };

    // Supabase에 전자책 정보 저장
    const { data: ebook, error } = await supabase
        .from("ebooks")
        .insert(ebookData)
        .select()
        .single();

    if (error) {
        console.error("전자책 생성 중 오류가 발생했습니다:", error);
        return { error: "전자책 생성 중 오류가 발생했습니다." };
    }

    // 페이지 생성
    if (ebook && pages.length > 0) {
        try {
            const formattedPages = JSON.parse(formData.get("pages") as string).map((page: any) => ({
                ebook_id: ebook.ebook_id,
                position: page.position,
                title: page.title,
                blocks: page.blocks,
                page_number: page.position // 페이지 번호와 위치를 동일하게 설정
            }));

            const { error: pagesError } = await supabase
                .from("ebook_pages")
                .insert(formattedPages);

            if (pagesError) {
                console.error("페이지 생성 중 오류가 발생했습니다:", pagesError);
            }
        } catch (pageError) {
            console.error("페이지 생성 중 오류가 발생했습니다:", pageError);
        }
    }

    return { success: true, ebookId: ebook?.ebook_id };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "새 전자책 만들기" },
        { name: "description", content: "새로운 전자책을 만들어보세요" },
    ];
}

export default function EbookNewPage({ actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState<string>("draft");
    const [sampleContent, setSampleContent] = useState("");
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [pageCount, setPageCount] = useState("");
    const [readingTime, setReadingTime] = useState("");
    const [language, setLanguage] = useState<string>("ko");
    const [isbn, setIsbn] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [publicationDate, setPublicationDate] = useState("");
    const [pages, setPages] = useState<PageItem[]>([]);
    const [activeTab, setActiveTab] = useState("basic");

    // 폼 제출 후 리디렉션
    if (actionData?.success) {
        navigate(`/ebooks/${actionData.ebookId}`);
    }

    const handleCoverImageChange = (file: File) => {
        setCoverImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setCoverImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handlePagesChange = (updatedPages: PageItem[]) => {
        setPages(updatedPages);
        // 페이지 수 자동 업데이트
        setPageCount(updatedPages.length.toString());
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

            <Form method="post" className="space-y-8" id="new-ebook-form">
                <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">기본 정보</TabsTrigger>
                        <TabsTrigger value="metadata">메타데이터</TabsTrigger>
                        <TabsTrigger value="pages">페이지</TabsTrigger>
                        <TabsTrigger value="sample">샘플 콘텐츠</TabsTrigger>
                    </TabsList>

                    {/* 기본 정보 탭 */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">기본 정보</CardTitle>
                                <CardDescription>
                                    새 전자책의 기본 정보를 입력하세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">제목</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="전자책 제목을 입력하세요"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">설명</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="전자책에 대한 간단한 설명을 입력하세요"
                                                rows={4}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="price">가격 (원)</Label>
                                                <Input
                                                    id="price"
                                                    name="price"
                                                    type="number"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    placeholder="가격을 입력하세요"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="status">상태</Label>
                                                <Select name="status" value={status} onValueChange={setStatus}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="상태 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EBOOK_STATUS.map((statusOption) => (
                                                            <SelectItem key={statusOption} value={statusOption}>
                                                                {statusOption === "published" ? "출판됨" :
                                                                    statusOption === "draft" ? "초안" : "보관됨"}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="is_featured"
                                                name="is_featured"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                                className="rounded"
                                            />
                                            <Label htmlFor="is_featured">추천 eBook으로 표시</Label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="block mb-2">표지 이미지</Label>
                                        <EbookCover
                                            imageUrl={coverImagePreview || undefined}
                                            alt={title || "새 eBook"}
                                            editable={true}
                                            onImageChange={handleCoverImageChange}
                                            className="w-full aspect-[2/3]"
                                        />
                                        <input
                                            type="hidden"
                                            name="cover_image_file"
                                            value={coverImageFile?.name || ""}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 메타데이터 탭 */}
                    <TabsContent value="metadata" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">메타데이터</CardTitle>
                                <CardDescription>
                                    전자책의 상세 정보를 입력하세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="page_count">페이지 수</Label>
                                        <Input
                                            id="page_count"
                                            name="page_count"
                                            type="number"
                                            value={pageCount}
                                            onChange={(e) => setPageCount(e.target.value)}
                                            placeholder="페이지 수를 입력하세요"
                                            min="1"
                                            readOnly
                                        />
                                        <p className="text-xs text-gray-500">페이지 수는 자동으로 계산됩니다.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reading_time">읽기 시간 (분)</Label>
                                        <Input
                                            id="reading_time"
                                            name="reading_time"
                                            type="number"
                                            value={readingTime}
                                            onChange={(e) => setReadingTime(e.target.value)}
                                            placeholder="예상 읽기 시간을 분 단위로 입력하세요"
                                            min="1"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="language">언어</Label>
                                        <Select name="language" value={language} onValueChange={setLanguage}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="언어 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ko">한국어</SelectItem>
                                                <SelectItem value="en">영어</SelectItem>
                                                <SelectItem value="ja">일본어</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="publication_date">출판일</Label>
                                        <Input
                                            id="publication_date"
                                            name="publication_date"
                                            type="date"
                                            value={publicationDate}
                                            onChange={(e) => setPublicationDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="isbn">ISBN</Label>
                                        <Input
                                            id="isbn"
                                            name="isbn"
                                            value={isbn}
                                            onChange={(e) => setIsbn(e.target.value)}
                                            placeholder="ISBN을 입력하세요 (선택사항)"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 페이지 탭 */}
                    <TabsContent value="pages" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">페이지 관리</CardTitle>
                                <CardDescription>
                                    전자책의 페이지를 추가하고 관리하세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PageEditor
                                    pages={pages}
                                    editable={true}
                                    onPagesChange={handlePagesChange}
                                />
                                <input
                                    type="hidden"
                                    name="pages"
                                    value={JSON.stringify(pages)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 샘플 콘텐츠 탭 */}
                    <TabsContent value="sample" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">샘플 콘텐츠 작성</CardTitle>
                                <CardDescription>
                                    무료로 제공할 샘플 콘텐츠를 작성하세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MarkdownEditor
                                    value={sampleContent}
                                    onChange={setSampleContent}
                                    placeholder="마크다운 형식으로 샘플 콘텐츠를 작성하세요"
                                    minHeight={300}
                                />
                                <input
                                    type="hidden"
                                    name="sample_content"
                                    value={sampleContent}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        저장하기
                    </Button>
                </div>
            </Form>
        </div>
    );
} 