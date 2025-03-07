import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { Slider } from "~/common/components/ui/slider";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface ReadingProgressProps {
    ebookId: string;
    userId: string;
    pageCount: number;
    progress: {
        current_page: number;
        progress_percentage: number;
        last_read_at: string;
        is_completed: boolean;
    };
    onProgressUpdate: (data: {
        current_page: number;
        progress_percentage: number;
        is_completed: boolean;
    }) => void;
    className?: string;
}

export function ReadingProgress({
    ebookId,
    userId,
    pageCount,
    progress,
    onProgressUpdate,
    className = "",
}: ReadingProgressProps) {
    const [currentPage, setCurrentPage] = useState(progress.current_page);
    const [isEditing, setIsEditing] = useState(false);

    const handleSliderChange = (value: number[]) => {
        setCurrentPage(value[0]);
    };

    const handleSave = () => {
        const progressPercentage = (currentPage / pageCount) * 100;
        const isCompleted = currentPage === pageCount;

        onProgressUpdate({
            current_page: currentPage,
            progress_percentage: progressPercentage,
            is_completed: isCompleted,
        });

        setIsEditing(false);
    };

    const progressPercentage = Math.round((currentPage / pageCount) * 100);

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>독서 진행률</CardTitle>
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            수정
                        </Button>
                    ) : (
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                취소
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                                저장
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
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
                                    stroke="#3b82f6"
                                    strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 45 * progressPercentage / 100} ${2 * Math.PI * 45 * (100 - progressPercentage) / 100}`}
                                    strokeDashoffset={2 * Math.PI * 45 * 25 / 100}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                {progress.is_completed ? (
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

                    <div className="text-center space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span>
                                {currentPage} / {pageCount} 페이지
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            마지막 읽은 날짜: {format(new Date(progress.last_read_at), "yyyy년 MM월 dd일", { locale: ko })}
                        </p>
                    </div>

                    {isEditing && (
                        <div className="pt-4">
                            <p className="text-sm font-medium mb-2">현재 페이지 설정</p>
                            <div className="space-y-4">
                                <Slider
                                    value={[currentPage]}
                                    min={0}
                                    max={pageCount}
                                    step={1}
                                    onValueChange={handleSliderChange}
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>0</span>
                                    <span>{pageCount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 