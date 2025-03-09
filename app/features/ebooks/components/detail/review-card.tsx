import { useState } from "react";
import { MessageSquare, Star, Trash, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "~/common/components/ui/dialog";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { EbookCardFrame } from "./ebook-card-frame";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/supa-client";
import type { Database } from "database.types";
import { toast } from "sonner";

// 리뷰 타입 정의
type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
    profiles?: {
        name?: string;
        username?: string;
    };
};

// 페이지네이션 컴포넌트
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
                {currentPage} / {totalPages || 1}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

// 별점 컴포넌트
interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    interactive?: boolean;
}

function StarRating({ rating, onChange, interactive = false }: StarRatingProps) {
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
        <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    className={`focus:outline-none ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => interactive && onChange?.(i + 1)}
                    onMouseEnter={() => interactive && setHoveredRating(i + 1)}
                    onMouseLeave={() => interactive && setHoveredRating(0)}
                    disabled={!interactive}
                >
                    <Star
                        className={`h-5 w-5 ${i < (interactive ? hoveredRating || rating : rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                            } transition-colors`}
                    />
                </button>
            ))}
            {interactive && (
                <span className="ml-2 text-sm text-gray-500">
                    {rating > 0 ? `${rating}점` : "별점을 선택하세요"}
                </span>
            )}
        </div>
    );
}

// 리뷰 폼 컴포넌트
interface ReviewFormProps {
    ebookId: string;
    initialRating?: number;
    initialComment?: string;
    isEdit?: boolean;
    reviewId?: string;
    onCancel: () => void;
}

function ReviewForm({
    ebookId,
    initialRating = 0,
    initialComment = "",
    isEdit = false,
    reviewId,
    onCancel,
}: ReviewFormProps) {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);
    const queryClient = useQueryClient();

    // 리뷰 생성 뮤테이션
    const createReviewMutation = useMutation({
        mutationFn: async (data: { rating: number; comment: string }) => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("로그인이 필요합니다.");

            const { data: result, error } = await supabase
                .from("reviews")
                .insert({
                    ebook_id: ebookId,
                    user_id: userData.user.id,
                    rating: data.rating,
                    comment: data.comment,
                })
                .select();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            // 리뷰 목록, 사용자 리뷰, 리뷰 개수 쿼리 모두 무효화
            queryClient.invalidateQueries({ queryKey: ["reviews", ebookId] });
            queryClient.invalidateQueries({ queryKey: ["userReview", ebookId] });
            queryClient.invalidateQueries({ queryKey: ["reviewCount", ebookId] });
            toast.success("리뷰가 등록되었습니다.");
            onCancel();
        },
    });

    // 리뷰 수정 뮤테이션
    const updateReviewMutation = useMutation({
        mutationFn: async (data: { rating: number; comment: string }) => {
            if (!reviewId) throw new Error("리뷰 ID가 필요합니다.");

            const { data: result, error } = await supabase
                .from("reviews")
                .update({
                    rating: data.rating,
                    comment: data.comment,
                    updated_at: new Date().toISOString(),
                })
                .eq("review_id", reviewId)
                .select();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            // 리뷰 목록, 사용자 리뷰, 리뷰 개수 쿼리 모두 무효화
            queryClient.invalidateQueries({ queryKey: ["reviews", ebookId] });
            queryClient.invalidateQueries({ queryKey: ["userReview", ebookId] });
            queryClient.invalidateQueries({ queryKey: ["reviewCount", ebookId] });
            toast.success("리뷰가 수정되었습니다.");
            onCancel();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return; // 별점은 필수

        const reviewData = {
            rating,
            comment,
        };

        if (isEdit && reviewId) {
            updateReviewMutation.mutate(reviewData);
        } else {
            createReviewMutation.mutate(reviewData);
        }
    };

    const isLoading = createReviewMutation.isPending || updateReviewMutation.isPending;
    const error = createReviewMutation.error || updateReviewMutation.error;

    return (
        <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">
                {isEdit ? "리뷰 수정" : "리뷰 작성"}
            </h3>
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                    {error.message}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="text-sm font-medium mb-2">별점</div>
                    <StarRating rating={rating} onChange={setRating} interactive />
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

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        취소
                    </Button>
                    <Button type="submit" disabled={rating === 0 || isLoading}>
                        {isLoading ? "처리 중..." : isEdit ? "수정하기" : "등록하기"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// 리뷰 아이템 컴포넌트
interface ReviewItemProps {
    review: Review;
    currentUserId: string;
    onEdit: (review: Review) => void;
    onDelete: (reviewId: string) => void;
}

function ReviewItem({ review, currentUserId, onEdit, onDelete }: ReviewItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isOwner = currentUserId === review.user_id;
    const commentLength = review.comment?.length || 0;
    const shouldTruncate = commentLength > 150 && !isExpanded;

    return (
        <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                    <Avatar>
                        <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.profiles?.username || "User"}`}
                            alt={review.profiles?.name || "사용자"}
                        />
                        <AvatarFallback>
                            {(review.profiles?.name || review.profiles?.username || "사용자").substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">
                            {review.profiles?.name || review.profiles?.username || "사용자"}
                        </p>
                        <StarRating rating={review.rating} />
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    {format(new Date(review.created_at || new Date()), "yyyy년 MM월 dd일", {
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
                                onClick={() => setIsExpanded(!isExpanded)}
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
                        onClick={() => onEdit(review)}
                    >
                        <Edit className="h-3 w-3 mr-1" />
                        수정
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500"
                        onClick={() => onDelete(review.review_id)}
                    >
                        <Trash className="h-3 w-3 mr-1" />
                        삭제
                    </Button>
                </div>
            )}
        </div>
    );
}

// 리뷰 목록 컴포넌트
interface ReviewListProps {
    ebookId: string;
    currentUserId: string;
    onEdit: (review: Review) => void;
    onDelete: (reviewId: string) => void;
}

function ReviewList({ ebookId, currentUserId, onEdit, onDelete }: ReviewListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const queryClient = useQueryClient();

    // 리뷰 목록 쿼리
    const { data, isLoading, error } = useQuery({
        queryKey: ["reviews", ebookId, currentPage, pageSize],
        queryFn: async () => {
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            // 총 리뷰 수 가져오기
            const { count, error: countError } = await supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .eq("ebook_id", ebookId);

            if (countError) throw countError;

            // 페이지네이션된 리뷰 가져오기
            const { data, error } = await supabase
                .from("reviews")
                .select("*, profiles(name, username)")
                .eq("ebook_id", ebookId)
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;

            return {
                reviews: data as Review[],
                totalCount: count || 0,
            };
        },
    });

    // 리뷰 삭제 뮤테이션
    const deleteReviewMutation = useMutation({
        mutationFn: async (reviewId: string) => {
            const { error } = await supabase
                .from("reviews")
                .delete()
                .eq("review_id", reviewId);

            if (error) throw error;
            return reviewId;
        },
        onSuccess: () => {
            // 리뷰 목록과 사용자 리뷰 쿼리 모두 무효화
            queryClient.invalidateQueries({ queryKey: ["reviews", ebookId] });
            queryClient.invalidateQueries({ queryKey: ["userReview", ebookId, currentUserId] });
            queryClient.invalidateQueries({ queryKey: ["reviewCount", ebookId] });
        },
    });

    const handleDelete = (reviewId: string) => {
        onDelete(reviewId);
    };

    const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

    if (isLoading) {
        return <div className="text-center py-6">리뷰를 불러오는 중...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-6 text-red-500">
                리뷰를 불러오는 중 오류가 발생했습니다: {error.message}
            </div>
        );
    }

    if (!data || data.reviews.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-gray-500">아직 리뷰가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.reviews.map((review) => (
                <ReviewItem
                    key={review.review_id}
                    review={review}
                    currentUserId={currentUserId}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                />
            ))}

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}

// 메인 리뷰 카드 컴포넌트
interface ReviewCardProps {
    ebookId: string;
    currentUserId: string;
    className?: string;
}

export function ReviewCard({
    ebookId,
    currentUserId,
    className = ""
}: ReviewCardProps) {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 리뷰 총 개수 쿼리
    const { data: reviewCount } = useQuery({
        queryKey: ["reviewCount", ebookId],
        queryFn: async () => {
            const { count, error } = await supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .eq("ebook_id", ebookId);

            if (error) throw error;
            return count || 0;
        },
    });

    const handleStartEdit = (review: Review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleCancelForm = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    // 사용자가 이미 리뷰를 작성했는지 확인
    const { data: userReview, isLoading: checkingUserReview } = useQuery({
        queryKey: ["userReview", ebookId, currentUserId],
        queryFn: async () => {
            if (!currentUserId) return null;

            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .eq("ebook_id", ebookId)
                .eq("user_id", currentUserId)
                .maybeSingle();

            if (error) throw error;
            return data as Review | null;
        },
        enabled: !!currentUserId,
    });

    // 디버깅용 로그
    console.log("userReview:", userReview, "checkingUserReview:", checkingUserReview);

    // 리뷰 작성 가능 여부 (로딩 중이 아니고, 사용자 리뷰가 없고, 리뷰 폼이 표시되지 않은 경우)
    const canWriteReview = !checkingUserReview && !userReview && !showReviewForm;

    // 리뷰 삭제 핸들러
    const handleDeleteReview = (reviewId: string) => {
        setReviewToDelete(reviewId);
    };

    // 리뷰 삭제 뮤테이션
    const deleteReviewMutation = async () => {
        try {
            if (!reviewToDelete) return;

            const { error } = await supabase
                .from("reviews")
                .delete()
                .eq("review_id", reviewToDelete);

            if (error) throw error;

            // 리뷰 목록과 사용자 리뷰 쿼리 모두 무효화
            queryClient.invalidateQueries({ queryKey: ["reviews", ebookId] });
            queryClient.invalidateQueries({ queryKey: ["userReview", ebookId, currentUserId] });
            queryClient.invalidateQueries({ queryKey: ["reviewCount", ebookId] });

            toast.success("리뷰가 삭제되었습니다.");
            setReviewToDelete(null);
        } catch (error) {
            console.error("리뷰 삭제 중 오류 발생:", error);
            toast.error("리뷰 삭제 중 오류가 발생했습니다.");
            setReviewToDelete(null);
        }
    };

    return (
        <>
            <EbookCardFrame
                title={`리뷰 (${reviewCount || 0})`}
                icon={MessageSquare}
                className={className}
            >
                <div className="space-y-6">
                    {showReviewForm ? (
                        <ReviewForm
                            ebookId={ebookId}
                            initialRating={editingReview?.rating || 0}
                            initialComment={editingReview?.comment || ""}
                            isEdit={!!editingReview}
                            reviewId={editingReview?.review_id}
                            onCancel={handleCancelForm}
                        />
                    ) : (
                        <>
                            <ReviewList
                                ebookId={ebookId}
                                currentUserId={currentUserId}
                                onEdit={handleStartEdit}
                                onDelete={handleDeleteReview}
                            />

                            {canWriteReview && (
                                <Button onClick={() => setShowReviewForm(true)}>
                                    리뷰 작성하기
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </EbookCardFrame>

            {/* 리뷰 삭제 확인 대화상자 */}
            <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>리뷰 삭제</DialogTitle>
                        <DialogDescription>
                            정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewToDelete(null)}>
                            취소
                        </Button>
                        <Button variant="destructive" onClick={deleteReviewMutation}>
                            삭제
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 