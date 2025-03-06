import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { Activity, Eye, ThumbsUp, MessageSquare, Share2, Bookmark, Star } from "lucide-react";
import { Link } from "react-router";
import { USER_ACTION_TYPES } from "../constants";
import type { Route } from "./+types/activities-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 사용자의 활동 내역을 가져옵니다.
    return {
        activities: [
            {
                action_id: "1",
                action_type: "view",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                created_at: "2023-04-15T10:30:00Z",
            },
            {
                action_id: "2",
                action_type: "like",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                created_at: "2023-04-15T10:35:00Z",
            },
            {
                action_id: "3",
                action_type: "comment",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                comment: "정말 유익한 책입니다!",
                created_at: "2023-04-15T10:40:00Z",
            },
            {
                action_id: "4",
                action_type: "view",
                ebook_id: "2",
                ebook_title: "리액트 기초부터 고급까지",
                created_at: "2023-04-14T14:20:00Z",
            },
            {
                action_id: "5",
                action_type: "share",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                share_type: "twitter",
                created_at: "2023-04-13T09:15:00Z",
            },
        ],
        reviews: [
            {
                review_id: "1",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                rating: 5,
                comment: "정말 유익한 책입니다!",
                created_at: "2023-04-15T10:40:00Z",
            },
            {
                review_id: "2",
                ebook_id: "2",
                ebook_title: "리액트 기초부터 고급까지",
                rating: 4,
                comment: "좋은 내용이지만 초보자에게는 조금 어려울 수 있습니다.",
                created_at: "2023-04-10T15:30:00Z",
            },
        ],
        bookmarks: [
            {
                bookmark_id: "1",
                ebook_id: "1",
                ebook_title: "마크다운으로 배우는 프로그래밍",
                created_at: "2023-04-12T11:20:00Z",
            },
            {
                bookmark_id: "2",
                ebook_id: "3",
                ebook_title: "타입스크립트 마스터하기",
                created_at: "2023-04-08T09:45:00Z",
            },
        ],
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "내 활동" },
        { name: "description", content: "내 활동 내역을 확인하세요" },
    ];
}

export default function ActivitiesPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { activities, reviews, bookmarks } = loaderData;
    const [activeTab, setActiveTab] = useState("all");

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "오늘";
        } else if (diffDays === 1) {
            return "어제";
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    };

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case "view":
                return <Eye className="h-5 w-5 text-blue-500" />;
            case "like":
                return <ThumbsUp className="h-5 w-5 text-green-500" />;
            case "comment":
                return <MessageSquare className="h-5 w-5 text-purple-500" />;
            case "share":
                return <Share2 className="h-5 w-5 text-orange-500" />;
            default:
                return <Activity className="h-5 w-5 text-gray-500" />;
        }
    };

    const getActionText = (action: any) => {
        switch (action.action_type) {
            case "view":
                return `"${action.ebook_title}" 전자책을 읽었습니다.`;
            case "like":
                return `"${action.ebook_title}" 전자책을 좋아합니다.`;
            case "comment":
                return `"${action.ebook_title}" 전자책에 댓글을 남겼습니다: "${action.comment}"`;
            case "share":
                return `"${action.ebook_title}" 전자책을 공유했습니다.`;
            default:
                return `"${action.ebook_title}" 전자책에 활동했습니다.`;
        }
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

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">내 활동</h1>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="all">전체 활동</TabsTrigger>
                    <TabsTrigger value="reviews">리뷰</TabsTrigger>
                    <TabsTrigger value="bookmarks">북마크</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    {activities.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-lg font-medium">활동 내역이 없습니다</h2>
                            <p className="mt-2 text-gray-500">
                                전자책을 읽고, 좋아요를 누르고, 댓글을 남겨보세요.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <Card key={activity.action_id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start">
                                            <div className="mr-4 mt-1">
                                                {getActionIcon(activity.action_type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{getActionText(activity)}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDate(activity.created_at)}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/ebooks/${activity.ebook_id}`}>
                                                    보기
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-lg font-medium">리뷰 내역이 없습니다</h2>
                            <p className="mt-2 text-gray-500">
                                전자책을 읽고 리뷰를 남겨보세요.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review.review_id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start">
                                            <div className="mr-4 mt-1">
                                                <MessageSquare className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">"{review.ebook_title}" 전자책에 리뷰를 남겼습니다.</p>
                                                <div className="flex items-center mt-1">
                                                    <div className="flex mr-2">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <p className="text-sm text-gray-700">{review.rating}/5</p>
                                                </div>
                                                <p className="mt-2 text-gray-700">"{review.comment}"</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDate(review.created_at)}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/ebooks/${review.ebook_id}`}>
                                                    보기
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="bookmarks">
                    {bookmarks.length === 0 ? (
                        <div className="text-center py-12">
                            <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-lg font-medium">북마크가 없습니다</h2>
                            <p className="mt-2 text-gray-500">
                                관심 있는 전자책을 북마크해보세요.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookmarks.map((bookmark) => (
                                <Card key={bookmark.bookmark_id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start">
                                            <div className="mr-4 mt-1">
                                                <Bookmark className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">"{bookmark.ebook_title}" 전자책을 북마크했습니다.</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDate(bookmark.created_at)}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/ebooks/${bookmark.ebook_id}`}>
                                                    보기
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
} 