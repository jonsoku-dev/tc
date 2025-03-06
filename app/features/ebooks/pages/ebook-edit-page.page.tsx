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
import { EBOOK_STATUS } from "../constants";
import type { Route } from "./+types/ebook-edit-page.page";

export function loader({ params }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 전자책 정보를 가져옵니다.
    return {
        ebook: {
            ebook_id: params.ebookId,
            title: "마크다운으로 배우는 프로그래밍",
            description: "마크다운을 활용한 프로그래밍 학습 가이드입니다. 이 책은 마크다운의 기본 문법부터 고급 활용법까지 다양한 내용을 다루고 있습니다.",
            status: "published",
            price: "15000",
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
    const [status, setStatus] = useState(ebook.status);
    const [content, setContent] = useState(ebook.content);
    const [activeTab, setActiveTab] = useState("edit");

    // 폼 제출 후 리디렉션
    if (actionData?.success) {
        navigate(`/ebooks/${actionData.ebookId}`);
    }

    const renderMarkdown = (content: string) => {
        // 실제 구현에서는 마크다운을 HTML로 변환하는 라이브러리를 사용합니다.
        return <div dangerouslySetInnerHTML={{ __html: `<div class="prose">${content}</div>` }} />;
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">전자책 정보 편집</CardTitle>
                        <CardDescription>
                            전자책의 기본 정보를 수정하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">콘텐츠 편집</CardTitle>
                        <CardDescription>
                            마크다운 형식으로 콘텐츠를 작성하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="edit" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="edit">편집</TabsTrigger>
                                <TabsTrigger value="preview">미리보기</TabsTrigger>
                            </TabsList>
                            <TabsContent value="edit" className="min-h-[500px]">
                                <Textarea
                                    id="content"
                                    name="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="마크다운 형식으로 콘텐츠를 작성하세요"
                                    className="min-h-[500px] font-mono"
                                />
                            </TabsContent>
                            <TabsContent value="preview" className="min-h-[500px]">
                                {renderMarkdown(content)}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            저장하기
                        </Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    );
} 