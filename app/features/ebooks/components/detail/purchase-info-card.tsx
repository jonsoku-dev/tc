import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Book, Download, ShoppingCart } from "lucide-react";
import { EbookCardFrame } from "./ebook-card-frame";

interface PurchaseInfoCardProps {
    ebookId: string;
    price: number | null;
    className?: string;
}

export function PurchaseInfoCard({ ebookId, price, className = "" }: PurchaseInfoCardProps) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        // 장바구니 추가 로직 구현
        setTimeout(() => {
            setIsAddingToCart(false);
            // 성공 메시지 표시 등
        }, 1000);
    };

    return (
        <EbookCardFrame title="구매 정보" className={className}>
            <p className="text-3xl font-bold mb-4">{Number(price || 0).toLocaleString()}원</p>
            <div className="space-y-4">
                <Button className="w-full" asChild>
                    <Link to={`/ebooks/${ebookId}/read`}>
                        <Book className="mr-2 h-4 w-4" />
                        읽기
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isAddingToCart ? "추가 중..." : "장바구니에 추가"}
                </Button>
                <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    샘플 다운로드
                </Button>
            </div>
        </EbookCardFrame>
    );
} 