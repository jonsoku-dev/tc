import { useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { CheckCircle, ShoppingCart, Download } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/purchase-success-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 최근 구매 정보를 가져옵니다.
    return {
        purchase: {
            sale_id: "123456",
            total_amount: 30000,
            purchased_at: new Date().toISOString(),
            items: [
                {
                    ebook_id: "1",
                    title: "마크다운으로 배우는 프로그래밍",
                    price: "15000",
                },
                {
                    ebook_id: "2",
                    title: "리액트 기초부터 고급까지",
                    price: "20000",
                },
            ],
        },
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "결제 완료" },
        { name: "description", content: "결제가 성공적으로 완료되었습니다" },
    ];
}

export default function PurchaseSuccessPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { purchase } = loaderData;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold">결제가 완료되었습니다</h1>
                    <p className="text-gray-600 mt-2">
                        주문번호: {purchase.sale_id}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>주문 정보</CardTitle>
                        <CardDescription>
                            결제일시: {formatDate(purchase.purchased_at)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-2">구매 상품</h3>
                            <div className="space-y-2">
                                {purchase.items.map((item) => (
                                    <div key={item.ebook_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-gray-600">{Number(item.price).toLocaleString()}원</p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/ebooks/${item.ebook_id}`}>
                                                <Download className="mr-2 h-4 w-4" />
                                                다운로드
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between font-bold">
                                <span>총 결제 금액</span>
                                <span>{purchase.total_amount.toLocaleString()}원</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild>
                            <Link to="/purchases">
                                주문 내역 보기
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link to="/ebooks">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                계속 쇼핑하기
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
} 