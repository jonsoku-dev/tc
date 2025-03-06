import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { ArrowLeft, MessageSquare, Star, Edit, Trash } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/reviews-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 사용자의 리뷰 목록을 가져옵니다.
    return {
        reviews: [
            {
                review_id: "1",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                rating: 5,
                comment: "정말 유익한 책입니다! 마크다운의 기본부터 고급 활용법까지 체계적으로 설명되어 있어 이해하기 쉬웠습니다. 특히 실습 예제가 많아서 직접 따라하면서 배울 수 있어 좋았습니다.",
                created_at: "2023-04-15T10:40:00Z",
            },
            {
                review_id: "2",
                ebook_id: "2",
                ebook_title: "리액트 기초부터 고급까지",
                rating: 4,
                comment: "좋은 내용이지만 초보자에게는 조금 어려울 수 있습니다. 리액트의 기본 개념부터 고급 패턴까지 다루고 있어 전반적인 이해에 도움이 됩니다. 다만 초보자를 위한 설명이 조금 더 자세했으면 좋겠습니다.",
                created_at: "2023-04-10T15:30:00Z",
            },
            {
                review_id: "3",
                ebook_id: "3",
                ebook_title: "타입스크립트 마스터하기",
                rating: 3,
                comment: "타입스크립트의 기본 문법과 활용법에 대해 잘 설명되어 있습니다. 하지만 고급 주제에 대한 설명이 부족하고, 실제 프로젝트에 적용하는 방법에 대한 예제가 더 많았으면 좋겠습니다.",
                created_at: "2023-03-25T09:20:00Z",
            },
        ],
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에서 리뷰를 삭제하거나 수정합니다.
    return { success: true };
}

export function meta() {
    return [
        { title: "내 리뷰" },
        { name: "description", content: "내가 작성한 리뷰 목록을 확인하세요" },
    ];
}

export default function ReviewsPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { reviews } = loaderData;
    const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                className={`h-4 w-4 ${index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
            />
        ));
    };

    const toggleExpand = (reviewId: string) => {
        setExpandedReviews({
            ...expandedReviews,
            [reviewId]: !expandedReviews[reviewId],
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
                <h1 className="text-3xl font-bold">내 리뷰</h1>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-4 text-lg font-medium">작성한 리뷰가 없습니다</h2>
                    <p className="mt-2 text-gray-500">
                        전자책을 읽고 리뷰를 남겨보세요.
                    </p>
                    <Button className="mt-4" asChild>
                        <Link to="/ebooks">
                            전자책 둘러보기
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <Card key={review.review_id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">{review.ebook_title}</CardTitle>
                                        <div className="flex items-center mt-1">
                                            <div className="flex mr-2">
                                                {renderStars(review.rating)}
                                            </div>
                                            <p className="text-sm text-gray-700">{review.rating}/5</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(review.created_at)}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <p className={expandedReviews[review.review_id] ? "" : "line-clamp-3"}>
                                    {review.comment}
                                </p>
                                {review.comment.length > 150 && (
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto mt-1 text-blue-500"
                                        onClick={() => toggleExpand(review.review_id)}
                                    >
                                        {expandedReviews[review.review_id] ? "접기" : "더 보기"}
                                    </Button>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between pt-2">
                                <Button variant="outline" asChild>
                                    <Link to={`/ebooks/${review.ebook_id}`}>
                                        전자책 보기
                                    </Link>
                                </Button>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="icon" asChild>
                                        <Link to={`/reviews/${review.review_id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Form method="post">
                                        <input type="hidden" name="action" value="delete_review" />
                                        <input type="hidden" name="review_id" value={review.review_id} />
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            size="icon"
                                            className="text-red-500"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </Form>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 