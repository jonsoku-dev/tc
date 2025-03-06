import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { ArrowLeft, Bookmark, Book, Trash } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/bookmarks-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 사용자의 북마크 목록을 가져옵니다.
    return {
        bookmarks: [
            {
                bookmark_id: "1",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                ebook_description: "마크다운을 활용한 프로그래밍 학습 가이드",
                ebook_price: "15000",
                created_at: "2023-04-12T11:20:00Z",
            },
            {
                bookmark_id: "2",
                ebook_id: "3",
                ebook_title: "타입스크립트 마스터하기",
                ebook_description: "타입스크립트 심화 학습",
                ebook_price: "18000",
                created_at: "2023-04-08T09:45:00Z",
            },
            {
                bookmark_id: "3",
                ebook_id: "4",
                ebook_title: "Node.js 백엔드 개발",
                ebook_description: "Node.js를 활용한 서버 개발 가이드",
                ebook_price: "22000",
                created_at: "2023-04-05T14:30:00Z",
            },
        ],
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에서 북마크를 삭제합니다.
    return { success: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "북마크" },
        { name: "description", content: "북마크한 전자책 목록을 확인하세요" },
    ];
}

export default function BookmarksPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { bookmarks } = loaderData;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/activities")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                활동 목록으로 돌아가기
            </Button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">북마크</h1>
            </div>

            {bookmarks.length === 0 ? (
                <div className="text-center py-12">
                    <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-4 text-lg font-medium">북마크한 전자책이 없습니다</h2>
                    <p className="mt-2 text-gray-500">
                        관심 있는 전자책을 북마크해보세요.
                    </p>
                    <Button className="mt-4" asChild>
                        <Link to="/ebooks">
                            전자책 둘러보기
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map((bookmark) => (
                        <Card key={bookmark.bookmark_id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{bookmark.ebook_title}</CardTitle>
                                    <Form method="post">
                                        <input type="hidden" name="action" value="remove_bookmark" />
                                        <input type="hidden" name="bookmark_id" value={bookmark.bookmark_id} />
                                        <Button
                                            type="submit"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 h-8 w-8"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </Form>
                                </div>
                                <CardDescription>{bookmark.ebook_description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">
                                        {Number(bookmark.ebook_price).toLocaleString()}원
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        북마크: {formatDate(bookmark.created_at)}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" asChild>
                                    <Link to={`/ebooks/${bookmark.ebook_id}`}>
                                        <Book className="mr-2 h-4 w-4" />
                                        전자책 보기
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 