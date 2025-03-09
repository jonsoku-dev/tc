import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "~/common/components/ui/badge";
import { Button } from "~/common/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Calendar, Clock, Book, Globe, Hash, Star, Share2, Heart } from "lucide-react";
import { EbookCardFrame } from "./ebook-card-frame";
import { EbookCover } from "../ebook-cover";

interface EbookHeaderCardProps {
    ebook: {
        ebook_id: string;
        title: string;
        description: string | null;
        cover_image_url?: string | null;
        ebook_status: string;
        is_featured?: boolean | null;
        publication_date?: string | null;
        reading_time?: number | null;
        page_count?: number | null;
        language?: string | null;
        isbn?: string | null;
    };
    avgRating: number;
    reviewCount: number;
    categoryNames: string[];
    className?: string;
}

export function EbookHeaderCard({
    ebook,
    avgRating,
    reviewCount,
    categoryNames,
    className = ""
}: EbookHeaderCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const statusColors = {
        published: "bg-green-100 text-green-800",
        draft: "bg-yellow-100 text-yellow-800",
        archived: "bg-gray-100 text-gray-800",
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // 실제 구현에서는 Supabase에 즐겨찾기 상태를 저장합니다.
        console.log("즐겨찾기 상태 변경:", !isFavorite);
    };

    const handleShare = () => {
        // 공유 기능 구현
        if (navigator.share) {
            navigator.share({
                title: ebook.title,
                text: ebook.description || "",
                url: window.location.href,
            }).catch(error => console.log('공유 실패:', error));
        } else {
            // 클립보드에 URL 복사
            navigator.clipboard.writeText(window.location.href)
                .then(() => alert('URL이 클립보드에 복사되었습니다.'))
                .catch(err => console.error('클립보드 복사 실패:', err));
        }
    };

    return (
        <EbookCardFrame
            title=""
            className={className}
            headerClassName="pb-0"
            contentClassName="p-0"
        >
            <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <EbookCover
                            imageUrl={ebook.cover_image_url || undefined}
                            alt={ebook.title}
                            className="w-full aspect-[2/3] rounded-md shadow-md hover:shadow-lg transition-shadow"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-bold">{ebook.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{ebook.description}</CardDescription>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Badge className={statusColors[ebook.ebook_status as keyof typeof statusColors]}>
                                    {ebook.ebook_status === "published" ? "출판됨" :
                                        ebook.ebook_status === "draft" ? "초안" : "보관됨"}
                                </Badge>
                                {ebook.is_featured && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                        추천 도서
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* 평점 표시 */}
                        <div className="flex items-center mt-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                                {avgRating.toFixed(1)} ({reviewCount}개 리뷰)
                            </span>
                        </div>

                        {/* 카테고리 표시 */}
                        {categoryNames.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {categoryNames.map((name, index) => (
                                    <Badge key={index} variant="secondary" className="bg-gray-100">
                                        {name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* 메타데이터 */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                    출판일: {ebook.publication_date ?
                                        format(new Date(ebook.publication_date), "yyyy년 MM월 dd일", { locale: ko }) :
                                        "미정"}
                                </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>
                                    읽기 시간: {ebook.reading_time ?
                                        `약 ${Math.floor(ebook.reading_time / 60)}시간 ${ebook.reading_time % 60}분` :
                                        "미정"}
                                </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Book className="h-4 w-4 mr-2" />
                                <span>페이지: {ebook.page_count || 0}쪽</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Globe className="h-4 w-4 mr-2" />
                                <span>
                                    언어: {ebook.language === "ko" ? "한국어" :
                                        ebook.language === "en" ? "영어" :
                                            ebook.language === "ja" ? "일본어" : ebook.language}
                                </span>
                            </div>
                            {ebook.isbn && (
                                <div className="flex items-center text-sm text-gray-500 col-span-2">
                                    <Hash className="h-4 w-4 mr-2" />
                                    <span>ISBN: {ebook.isbn}</span>
                                </div>
                            )}
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            <Button size="sm" variant="outline" onClick={handleToggleFavorite}>
                                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleShare}>
                                <Share2 className="mr-2 h-4 w-4" />
                                공유하기
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </EbookCardFrame>
    );
} 