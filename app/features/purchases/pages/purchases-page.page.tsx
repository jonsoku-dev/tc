import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { ShoppingCart, Download, Book } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/purchases-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 구매 내역을 가져옵니다.
    return {
        purchases: [
            {
                sale_id: "1",
                ebook_id: "1",
                title: "마크다운으로 배우는 프로그래밍",
                price: "15000",
                purchased_at: "2023-03-01T12:00:00Z",
                payment_type: "credit_card",
            },
            {
                sale_id: "2",
                ebook_id: "2",
                title: "리액트 기초부터 고급까지",
                price: "20000",
                purchased_at: "2023-03-15T14:30:00Z",
                payment_type: "paypal",
            },
            {
                sale_id: "3",
                ebook_id: "3",
                title: "타입스크립트 마스터하기",
                price: "18000",
                purchased_at: "2023-04-01T09:15:00Z",
                payment_type: "bank_transfer",
            },
        ],
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "구매 내역" },
        { name: "description", content: "구매한 전자책 목록을 확인하세요" },
    ];
}

export default function PurchasesPage({ loaderData }: Route.ComponentProps) {
    const { purchases } = loaderData;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getPaymentTypeText = (type: string) => {
        switch (type) {
            case "credit_card":
                return "신용카드";
            case "bank_transfer":
                return "계좌이체";
            case "paypal":
                return "페이팔";
            default:
                return type;
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">구매 내역</h1>
                <Button asChild>
                    <Link to="/ebooks">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        더 많은 전자책 둘러보기
                    </Link>
                </Button>
            </div>

            {purchases.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-4 text-lg font-medium">구매 내역이 없습니다</h2>
                    <p className="mt-2 text-gray-500">전자책을 구매하고 지식을 쌓아보세요.</p>
                    <Button className="mt-4" asChild>
                        <Link to="/ebooks">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            전자책 둘러보기
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {purchases.map((purchase) => (
                        <Card key={purchase.sale_id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{purchase.title}</CardTitle>
                                    <Badge className="bg-green-100 text-green-800">
                                        {getPaymentTypeText(purchase.payment_type)}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    구매일: {formatDate(purchase.purchased_at)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">가격: {Number(purchase.price).toLocaleString()}원</p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" asChild>
                                    <Link to={`/ebooks/${purchase.ebook_id}`}>
                                        <Book className="mr-2 h-4 w-4" />
                                        보기
                                    </Link>
                                </Button>
                                <Button>
                                    <Download className="mr-2 h-4 w-4" />
                                    다운로드
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 