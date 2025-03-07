import { useState, useEffect } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { EBOOK_STATUS } from "../constants";
import { EbookCover } from "../components/ebook-cover";
import { MarkdownEditor } from "../components/markdown-editor";
import { TableOfContents } from "../components/table-of-contents";
import type { Route } from "./+types/ebook-edit-page.page";
import { createClient } from "~/supa-client";
import { useSupabase } from "~/common/hooks/use-supabase";
import { toast } from "sonner";

export async function loader({ params }: Route.LoaderArgs) {
    const ebookId = params.ebookId;

    if (!ebookId) {
        throw new Response("전자책 ID가 필요합니다.", { status: 400 });
    }

    // Supabase 클라이언트 생성
    const supabase = createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    });

    try {
        // 전자책 정보 가져오기
        const { data: ebook, error: ebookError } = await supabase
            .from('ebooks')
            .select('*')
            .eq('ebook_id', ebookId)
            .single();

        if (ebookError) {
            console.error("전자책 정보 조회 오류:", ebookError);
            throw new Response("전자책 정보를 가져오는 중 오류가 발생했습니다.", { status: 500 });
        }

        if (!ebook) {
            throw new Response("전자책을 찾을 수 없습니다.", { status: 404 });
        }

        // 전자책 페이지 가져오기
        const { data: pages, error: pagesError } = await supabase
            .from('ebook_pages')
            .select('*')
            .eq('ebook_id', ebookId)
            .order('page_number', { ascending: true });

        if (pagesError) {
            console.error("전자책 페이지 조회 오류:", pagesError);
            throw new Response("전자책 페이지를 가져오는 중 오류가 발생했습니다.", { status: 500 });
        }

        // 페이지 제목을 기반으로 목차 생성 (필요한 경우)
        if (!ebook.table_of_contents || !Array.isArray(ebook.table_of_contents) || ebook.table_of_contents.length === 0) {
            ebook.table_of_contents = pages?.map(page => page.title || `${page.page_number}페이지`) || [];
        }

        return {
            ebook: {
                ...ebook,
                pages: pages || [],
            },
        };
    } catch (error) {
        console.error("전자책 데이터 로딩 오류:", error);
        if (error instanceof Response) {
            throw error;
        }
        throw new Response("전자책 데이터를 가져오는 중 오류가 발생했습니다.", { status: 500 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    const ebookId = params.ebookId;

    if (!ebookId) {
        return { success: false, error: "전자책 ID가 필요합니다." };
    }

    // Supabase 클라이언트 생성
    const supabase = createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    });

    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const status = formData.get("status") as string;
        const price = formData.get("price") as string;
        const publicationDate = formData.get("publicationDate") as string;
        const readingTime = formData.get("readingTime") as string;
        const language = formData.get("language") as string;
        const isFeatured = formData.get("isFeatured") === "true";
        const isbn = formData.get("isbn") as string;
        const coverImageUrl = formData.get("coverImageUrl") as string;
        const sampleContent = formData.get("sampleContent") as string;
        const tableOfContents = JSON.parse(formData.get("tableOfContents") as string || "[]");
        const content = formData.get("content") as string;

        // status 값이 유효한지 확인
        if (!EBOOK_STATUS.includes(status as any)) {
            return { success: false, error: "유효하지 않은 상태 값입니다." };
        }

        // 전자책 정보 업데이트
        const { error: updateError } = await supabase
            .from('ebooks')
            .update({
                title,
                description,
                ebook_status: status as "draft" | "published" | "archived",
                price: price ? parseFloat(price) : null,
                publication_date: publicationDate || null,
                reading_time: readingTime ? parseInt(readingTime, 10) : null,
                language,
                is_featured: isFeatured,
                isbn,
                cover_image_url: coverImageUrl,
                sample_content: sampleContent,
                table_of_contents: tableOfContents,
            })
            .eq('ebook_id', ebookId);

        if (updateError) {
            console.error("전자책 업데이트 오류:", updateError);
            return { success: false, error: "전자책 정보를 업데이트하는 중 오류가 발생했습니다." };
        }

        // 기존 페이지 가져오기
        const { data: existingPages, error: pagesError } = await supabase
            .from('ebook_pages')
            .select('*')
            .eq('ebook_id', ebookId)
            .order('page_number', { ascending: true });

        if (pagesError) {
            console.error("전자책 페이지 조회 오류:", pagesError);
            return { success: false, error: "전자책 페이지를 조회하는 중 오류가 발생했습니다." };
        }

        // 목차와 페이지 동기화
        // 1. 목차 항목 수와 페이지 수가 다르면 페이지 업데이트
        if (tableOfContents.length !== existingPages?.length) {
            // 페이지 수가 더 많으면 초과 페이지 삭제
            if (existingPages && existingPages.length > tableOfContents.length) {
                const pagesToDelete = existingPages.slice(tableOfContents.length);
                for (const page of pagesToDelete) {
                    await supabase
                        .from('ebook_pages')
                        .delete()
                        .eq('page_id', page.page_id);
                }
            }

            // 페이지 수가 더 적으면 새 페이지 추가
            if (existingPages && existingPages.length < tableOfContents.length) {
                const newPages = tableOfContents.slice(existingPages.length).map((title: string, index: number) => ({
                    ebook_id: ebookId,
                    page_number: existingPages.length + index + 1,
                    title,
                    content_type: 'text',
                    content: { content: `# ${title}\n\n내용을 입력하세요.`, style: {} }
                }));

                if (newPages.length > 0) {
                    await supabase
                        .from('ebook_pages')
                        .insert(newPages);
                }
            }
        }

        // 2. 기존 페이지 제목 업데이트
        const pagesToUpdate = Math.min(tableOfContents.length, existingPages?.length || 0);
        for (let i = 0; i < pagesToUpdate; i++) {
            if (existingPages && existingPages[i].title !== tableOfContents[i]) {
                await supabase
                    .from('ebook_pages')
                    .update({ title: tableOfContents[i] })
                    .eq('page_id', existingPages[i].page_id);
            }
        }

        return { success: true, ebookId };
    } catch (error) {
        console.error("전자책 업데이트 오류:", error);
        return { success: false, error: "전자책 정보를 업데이트하는 중 오류가 발생했습니다." };
    }
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: `${data.ebook.title} 편집` },
        { name: "description", content: "전자책 정보와 콘텐츠를 편집하세요" },
    ];
}

export default function EbookEditPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { ebook } = loaderData;
    const [title, setTitle] = useState(ebook.title);
    const [description, setDescription] = useState(ebook.description || "");
    const [status, setStatus] = useState<typeof EBOOK_STATUS[number]>(
        ebook.ebook_status as typeof EBOOK_STATUS[number] || "draft"
    );
    const [price, setPrice] = useState<string>(ebook.price?.toString() || "");
    const [publicationDate, setPublicationDate] = useState<string>(
        ebook.publication_date
            ? format(new Date(ebook.publication_date), "yyyy-MM-dd")
            : ""
    );
    const [readingTime, setReadingTime] = useState<string>(
        ebook.reading_time?.toString() || ""
    );
    const [language, setLanguage] = useState(ebook.language || "ko");
    const [isFeatured, setIsFeatured] = useState(ebook.is_featured || false);
    const [isbn, setIsbn] = useState(ebook.isbn || "");
    const [coverImageUrl, setCoverImageUrl] = useState(ebook.cover_image_url || "");
    const [sampleContent, setSampleContent] = useState(ebook.sample_content || "");
    const [tableOfContents, setTableOfContents] = useState<string[]>(
        Array.isArray(ebook.table_of_contents) ? ebook.table_of_contents as string[] : []
    );
    const [content, setContent] = useState<string>("");
    const [activeTab, setActiveTab] = useState("basic");
    const [isSaving, setIsSaving] = useState(false);
    const [showTocSyncAlert, setShowTocSyncAlert] = useState(false);

    // 전자책 버전 정보 가져오기
    useEffect(() => {
        async function fetchEbookContent() {
            if (ebook.ebook_id) {
                try {
                    const supabase = createClient({
                        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
                        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
                    });

                    const { data, error } = await supabase
                        .from('ebook_versions')
                        .select('content_markdown')
                        .eq('ebook_id', ebook.ebook_id)
                        .order('version_number', { ascending: false })
                        .limit(1);

                    if (!error && data && data.length > 0) {
                        setContent(data[0].content_markdown || "");
                    }
                } catch (error) {
                    console.error("전자책 콘텐츠 로딩 오류:", error);
                }
            }
        }

        fetchEbookContent();
    }, [ebook.ebook_id]);

    // 액션 결과 처리
    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                toast("저장 완료", {
                    description: "전자책 정보가 성공적으로 저장되었습니다.",
                });
                setIsSaving(false);
            } else if (actionData.error) {
                toast("저장 실패", {
                    description: actionData.error,
                });
                setIsSaving(false);
            }
        }
    }, [actionData]);

    // 목차 변경 시 페이지와의 동기화 알림 표시
    useEffect(() => {
        if (ebook.pages && ebook.pages.length > 0) {
            const pageCount = ebook.pages.length;
            const tocCount = tableOfContents.length;

            if (pageCount !== tocCount) {
                setShowTocSyncAlert(true);
            } else {
                // 제목 비교
                let hasDifference = false;
                for (let i = 0; i < pageCount; i++) {
                    if (ebook.pages[i].title !== tableOfContents[i]) {
                        hasDifference = true;
                        break;
                    }
                }
                setShowTocSyncAlert(hasDifference);
            }
        }
    }, [tableOfContents, ebook.pages]);

    const handleCoverImageChange = (file: File) => {
        // 실제 구현에서는 Supabase Storage에 이미지를 업로드하고 URL을 설정합니다.
        // 여기서는 간단히 File 객체를 URL로 변환하여 미리보기만 제공합니다.
        const url = URL.createObjectURL(file);
        setCoverImageUrl(url);
    };

    const handleTableOfContentsChange = (items: string[]) => {
        setTableOfContents(items);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        // Form 데이터 수동 제출
        const form = e.currentTarget;
        const formData = new FormData(form);

        // 목차 데이터 추가 (JSON 문자열로 변환)
        formData.set("tableOfContents", JSON.stringify(tableOfContents));

        // 폼 제출
        fetch(form.action, {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast("저장 완료", {
                        description: "전자책 정보가 성공적으로 저장되었습니다.",
                    });
                    setIsSaving(false);
                    setShowTocSyncAlert(false);
                } else {
                    toast("저장 실패", {
                        description: data.error || "저장 중 오류가 발생했습니다.",
                    });
                    setIsSaving(false);
                }
            })
            .catch(error => {
                console.error("저장 오류:", error);
                toast("저장 실패", {
                    description: "네트워크 오류가 발생했습니다.",
                });
                setIsSaving(false);
            });
    };

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mr-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">{title || "새 전자책"} 편집</h1>
            </div>

            <Form method="post" onSubmit={handleSubmit}>
                <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
                <input type="hidden" name="isFeatured" value={isFeatured.toString()} />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="basic">기본 정보</TabsTrigger>
                        <TabsTrigger value="content">콘텐츠</TabsTrigger>
                        <TabsTrigger value="toc">목차</TabsTrigger>
                        <TabsTrigger value="sample">샘플</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>기본 정보</CardTitle>
                                        <CardDescription>
                                            전자책의 기본 정보를 입력하세요.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">제목</Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
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
                                                rows={4}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="status">상태</Label>
                                                <Select
                                                    value={status}
                                                    onValueChange={(value: typeof EBOOK_STATUS[number]) => setStatus(value)}
                                                >
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="상태 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EBOOK_STATUS.map((status) => (
                                                            <SelectItem key={status} value={status}>
                                                                {status === "draft"
                                                                    ? "초안"
                                                                    : status === "published"
                                                                        ? "출판됨"
                                                                        : "보관됨"}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input type="hidden" name="status" value={status} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="price">가격</Label>
                                                <Input
                                                    id="price"
                                                    name="price"
                                                    type="number"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="publicationDate">출판일</Label>
                                                <Input
                                                    id="publicationDate"
                                                    name="publicationDate"
                                                    type="date"
                                                    value={publicationDate}
                                                    onChange={(e) => setPublicationDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="readingTime">읽기 시간 (분)</Label>
                                                <Input
                                                    id="readingTime"
                                                    name="readingTime"
                                                    type="number"
                                                    value={readingTime}
                                                    onChange={(e) => setReadingTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="language">언어</Label>
                                                <Select
                                                    value={language}
                                                    onValueChange={setLanguage}
                                                >
                                                    <SelectTrigger id="language">
                                                        <SelectValue placeholder="언어 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ko">한국어</SelectItem>
                                                        <SelectItem value="en">영어</SelectItem>
                                                        <SelectItem value="ja">일본어</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <input type="hidden" name="language" value={language} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="isbn">ISBN</Label>
                                                <Input
                                                    id="isbn"
                                                    name="isbn"
                                                    value={isbn}
                                                    onChange={(e) => setIsbn(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>표지 이미지</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <EbookCover
                                            imageUrl={coverImageUrl}
                                            alt={title}
                                            onImageChange={handleCoverImageChange}
                                            editable
                                        />
                                    </CardContent>
                                    <CardFooter>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="isFeatured"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                                className="rounded"
                                            />
                                            <Label htmlFor="isFeatured">추천 도서로 표시</Label>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="content">
                        <Card>
                            <CardHeader>
                                <CardTitle>전자책 콘텐츠</CardTitle>
                                <CardDescription>
                                    마크다운 형식으로 전자책 콘텐츠를 작성하세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MarkdownEditor
                                    value={content}
                                    onChange={setContent}
                                    minHeight={600}
                                />
                                <input type="hidden" name="content" value={content} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="toc">
                        <Card>
                            <CardHeader>
                                <CardTitle>목차 관리</CardTitle>
                                <CardDescription>
                                    전자책의 목차를 관리하세요. 목차 항목을 추가, 삭제, 순서 변경할 수 있습니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {showTocSyncAlert && (
                                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                                        <p className="font-medium">목차와 페이지가 동기화되지 않았습니다.</p>
                                        <p className="text-sm">목차를 변경하면 저장 시 페이지 구조도 함께 업데이트됩니다. 페이지가 추가되거나 삭제될 수 있습니다.</p>
                                    </div>
                                )}
                                <TableOfContents
                                    items={tableOfContents}
                                    editable={true}
                                    onItemsChange={handleTableOfContentsChange}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sample">
                        <Card>
                            <CardHeader>
                                <CardTitle>샘플 콘텐츠</CardTitle>
                                <CardDescription>
                                    전자책의 샘플 콘텐츠를 작성하세요. 이 내용은 구매 전 미리보기로 제공됩니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MarkdownEditor
                                    value={sampleContent}
                                    onChange={setSampleContent}
                                    minHeight={400}
                                />
                                <input type="hidden" name="sampleContent" value={sampleContent} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? "저장 중..." : "저장"}
                        {!isSaving && <Save className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </Form>
        </div>
    );
} 