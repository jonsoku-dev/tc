import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Button } from "~/common/components/ui/button";
import { Star, Trash, Edit } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Review {
    review_id: string;
    user_id: string;
    ebook_id: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    user?: {
        name?: string;
        avatar_url?: string;
    };
}

interface ReviewListProps {
    reviews: Review[];
    currentUserId?: string;
    onReviewDelete?: (reviewId: string) => void;
    onReviewEdit?: (review: Review) => void;
    className?: string;
}

export function ReviewList({
    reviews,
    currentUserId,
    onReviewDelete,
    onReviewEdit,
    className = "",
}: ReviewListProps) {
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

    const toggleExpand = (reviewId: string) => {
        setExpandedReviews((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(reviewId)) {
                newSet.delete(reviewId);
            } else {
                newSet.add(reviewId);
            }
            return newSet;
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
            />
        ));
    };

    if (reviews.length === 0) {
        return (
            <Card className={`${className}`}>
                <CardHeader>
                    <CardTitle>리뷰</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <p className="text-gray-500">아직 리뷰가 없습니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle>리뷰 ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const isExpanded = expandedReviews.has(review.review_id);
                        const isOwner = currentUserId === review.user_id;
                        const commentLength = review.comment?.length || 0;
                        const shouldTruncate = commentLength > 150 && !isExpanded;

                        return (
                            <div
                                key={review.review_id}
                                className="border rounded-lg p-4 space-y-2"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Avatar>
                                            <AvatarImage
                                                src={review.user?.avatar_url}
                                                alt={review.user?.name || "사용자"}
                                            />
                                            <AvatarFallback>
                                                {(review.user?.name || "사용자").substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {review.user?.name || "사용자"}
                                            </p>
                                            <div className="flex items-center space-x-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {format(new Date(review.created_at), "yyyy년 MM월 dd일", {
                                            locale: ko,
                                        })}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    {review.comment && (
                                        <>
                                            <p className={shouldTruncate ? "line-clamp-3" : ""}>
                                                {review.comment}
                                            </p>
                                            {commentLength > 150 && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 h-auto mt-1"
                                                    onClick={() => toggleExpand(review.review_id)}
                                                >
                                                    {isExpanded ? "접기" : "더 보기"}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {isOwner && (
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onReviewEdit?.(review)}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            수정
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500"
                                            onClick={() => onReviewDelete?.(review.review_id)}
                                        >
                                            <Trash className="h-3 w-3 mr-1" />
                                            삭제
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
} 