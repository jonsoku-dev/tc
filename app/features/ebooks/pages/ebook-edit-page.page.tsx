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
            content: `# 마크다운으로 배우는 프로그래밍

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
| HTML | 웹 페이지 구조화 언어 |`,
        },
    };
}

export function action({ request, params }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에 전자책 정보를 업데이트합니다.
    return { success: true, ebookId: params.ebookId };
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
    const [description, setDescription] = useState(ebook.description);
    const [price, setPrice] = useState(ebook.price);
    const [status, setStatus] = useState(ebook.ebook_status);
    const [content, setContent] = useState(ebook.content);
    const [sampleContent, setSampleContent] = useState(ebook.sample_content);
    const [coverImageUrl, setCoverImageUrl] = useState(ebook.cover_image_url);
    const [pageCount, setPageCount] = useState(ebook.page_count.toString());
    const [readingTime, setReadingTime] = useState(ebook.reading_time.toString());
    const [language, setLanguage] = useState(ebook.language);
    const [isbn, setIsbn] = useState(ebook.isbn || "");
    const [isFeatured, setIsFeatured] = useState(ebook.is_featured);
    const [publicationDate, setPublicationDate] = useState(
        ebook.publication_date ? format(new Date(ebook.publication_date), "yyyy-MM-dd") : ""
    );
    const [tableOfContents, setTableOfContents] = useState(ebook.table_of_contents);
    const [activeTab, setActiveTab] = useState("basic");

    // 폼 제출 후 리디렉션
    if (actionData?.success) {
        navigate(`/ebooks/${actionData.ebookId}`);
    }

    const handleCoverImageChange = (file: File) => {
        // 실제 구현에서는 Supabase Storage에 이미지를 업로드하고 URL을 받아옵니다.
        const reader = new FileReader();
        reader.onload = (e) => {
            setCoverImageUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate(`/ebooks/${ebook.ebook_id}`)}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                상세 페이지로 돌아가기
            </Button>

            <Form method="post" className="space-y-8">
                <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">기본 정보</TabsTrigger>
                        <TabsTrigger value="metadata">메타데이터</TabsTrigger>
                        <TabsTrigger value="content">콘텐츠</TabsTrigger>
                        <TabsTrigger value="sample">샘플 콘텐츠</TabsTrigger>
                    </TabsList>

                    {/* 기본 정보 탭 */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">기본 정보</CardTitle>
                                <CardDescription>
                                    전자책의 기본 정보를 수정하세요.
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
                                            imageUrl={coverImageUrl}
                                            alt={title}
                                            editable={true}
                                            onImageChange={handleCoverImageChange}
                                            className="w-full aspect-[2/3]"
                                        />
                                        <input
                                            type="hidden"
                                            name="cover_image_url"
                                            value={coverImageUrl || ""}
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
                                    전자책의 상세 정보를 수정하세요.
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
                                        />
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

                                <div className="space-y-2">
                                    <Label>목차</Label>
                                    <TableOfContents
                                        items={tableOfContents}
                                        editable={true}
                                        onItemsChange={setTableOfContents}
                                    />
                                    <input
                                        type="hidden"
                                        name="table_of_contents"
                                        value={JSON.stringify(tableOfContents)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 콘텐츠 탭 */}
                    <TabsContent value="content" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">콘텐츠 편집</CardTitle>
                                <CardDescription>
                                    마크다운 형식으로 콘텐츠를 작성하세요.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MarkdownEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="마크다운 형식으로 콘텐츠를 작성하세요"
                                    minHeight={500}
                                />
                                <input
                                    type="hidden"
                                    name="content"
                                    value={content}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 샘플 콘텐츠 탭 */}
                    <TabsContent value="sample" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">샘플 콘텐츠 편집</CardTitle>
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