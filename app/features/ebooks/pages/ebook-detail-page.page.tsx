import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { ArrowLeft, Edit, Download, ShoppingCart } from "lucide-react";
import type { Route } from "./+types/ebook-detail-page.page";

export function loader({ params }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 전자책 정보를 가져옵니다.
    return {
        ebook: {
            ebook_id: params.ebookId,
            title: "마크다운으로 배우는 프로그래밍",
            description: "마크다운을 활용한 프로그래밍 학습 가이드입니다. 이 책은 마크다운의 기본 문법부터 고급 활용법까지 다양한 내용을 다루고 있습니다.",
            status: "published",
            price: "15000",
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
    const { ebook } = loaderData;
    const [activeTab, setActiveTab] = useState("preview");

    const statusColors = {
        published: "bg-green-100 text-green-800",
        draft: "bg-yellow-100 text-yellow-800",
        archived: "bg-gray-100 text-gray-800",
    };

    const renderMarkdown = (content: string) => {
        // 실제 구현에서는 마크다운을 HTML로 변환하는 라이브러리를 사용합니다.
        return <div dangerouslySetInnerHTML={{ __html: `<div class="prose">${content}</div>` }} />;
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
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl">{ebook.title}</CardTitle>
                                    <CardDescription className="mt-2">{ebook.description}</CardDescription>
                                </div>
                                <Badge className={statusColors[ebook.status as keyof typeof statusColors]}>
                                    {ebook.status === "published" ? "출판됨" :
                                        ebook.status === "draft" ? "초안" : "보관됨"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="preview">미리보기</TabsTrigger>
                                    <TabsTrigger value="source">소스</TabsTrigger>
                                </TabsList>
                                <TabsContent value="preview" className="min-h-[500px]">
                                    {renderMarkdown(ebook.content)}
                                </TabsContent>
                                <TabsContent value="source" className="min-h-[500px]">
                                    <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
                                        {ebook.content}
                                    </pre>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>구매 정보</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold mb-4">{Number(ebook.price).toLocaleString()}원</p>
                            <div className="space-y-4">
                                <Button className="w-full">
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

                    <Card className="mt-6">
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