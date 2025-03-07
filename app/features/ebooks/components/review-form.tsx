import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewFormProps {
    ebookId: string;
    initialRating?: number;
    initialComment?: string;
    isEdit?: boolean;
    onSubmit: (data: { rating: number; comment: string }) => void;
    onCancel?: () => void;
    className?: string;
}

export function ReviewForm({
    ebookId,
    initialRating = 0,
    initialComment = "",
    isEdit = false,
    onSubmit,
    onCancel,
    className = "",
}: ReviewFormProps) {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return; // 별점은 필수

        onSubmit({
            rating,
            comment,
        });
    };

    return (
        <Card className={className}>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>{isEdit ? "리뷰 수정" : "리뷰 작성"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-sm font-medium mb-2">별점</div>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => setRating(i + 1)}
                                    onMouseEnter={() => setHoveredRating(i + 1)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                >
                                    <Star
                                        className={`h-6 w-6 ${i < (hoveredRating || rating)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                                {rating > 0 ? `${rating}점` : "별점을 선택하세요"}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm font-medium mb-2">리뷰 내용</div>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="이 eBook에 대한 생각을 자유롭게 작성해주세요."
                            rows={4}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            취소
                        </Button>
                    )}
                    <Button type="submit" disabled={rating === 0}>
                        {isEdit ? "수정하기" : "등록하기"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 