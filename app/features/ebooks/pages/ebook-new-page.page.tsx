import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import type { Route } from "./+types/ebook-new-page.page";

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에 전자책 정보를 저장합니다.
    return { success: true, ebookId: "new-ebook-id" };
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

    // 폼 제출 후 리디렉션
    if (actionData?.success) {
        navigate(`/ebooks/${actionData.ebookId}`);
    }

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

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">새 전자책 만들기</CardTitle>
                    <CardDescription>
                        새로운 전자책의 기본 정보를 입력하세요. 나중에 콘텐츠를 추가할 수 있습니다.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-6">
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
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" form="new-ebook-form">
                        <Save className="mr-2 h-4 w-4" />
                        저장하기
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
} 