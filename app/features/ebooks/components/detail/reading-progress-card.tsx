import { Book, CheckCircle2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { EbookCardFrame } from "./ebook-card-frame";
import { Link } from "react-router";

interface ReadingProgressCardProps {
    ebookId: string;
    userId: string;
    pageCount: number;
    progress: {
        current_page: number;
        progress_percentage: number;
        last_read_at: string;
        is_completed: boolean;
    };
    className?: string;
}

export function ReadingProgressCard({
    ebookId,
    userId,
    pageCount,
    progress,
    className = ""
}: ReadingProgressCardProps) {
    const currentPage = progress.current_page;
    const progressPercentage = Math.round((currentPage / pageCount) * 100);
    const isCompleted = progress.is_completed;

    return (
        <EbookCardFrame
            title="독서 진행률"
            icon={Book}
            className={className}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            {/* 배경 원 */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="10"
                            />
                            {/* 진행률 원 */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={isCompleted ? "#10b981" : "#3b82f6"}
                                strokeWidth="10"
                                strokeDasharray={`${2 * Math.PI * 45 * progressPercentage / 100} ${2 * Math.PI * 45 * (100 - progressPercentage) / 100}`}
                                strokeDashoffset={2 * Math.PI * 45 * 25 / 100}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {isCompleted ? (
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            ) : (
                                <>
                                    <span className="text-2xl font-bold">{progressPercentage}%</span>
                                    <span className="text-xs text-gray-500">완료</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                        <Book className="h-4 w-4 text-gray-500" />
                        <span>
                            {currentPage} / {pageCount} 페이지
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">
                        마지막 읽은 날짜: {format(new Date(progress.last_read_at), "yyyy년 MM월 dd일", { locale: ko })}
                    </p>
                </div>

                <div className="flex justify-center pt-2">
                    <Link to={`/ebooks/${ebookId}/read?page=${currentPage}`}>
                        <Button className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            {isCompleted ? "다시 읽기" : currentPage > 1 ? "이어서 읽기" : "읽기 시작하기"}
                        </Button>
                    </Link>
                </div>

                {isCompleted && (
                    <div className="flex items-center justify-center p-2 bg-green-50 rounded-md">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-700">완독했습니다!</span>
                    </div>
                )}
            </div>
        </EbookCardFrame>
    );
} 