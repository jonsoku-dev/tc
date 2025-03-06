import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { ShoppingCart, Trash, CreditCard, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/cart-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 장바구니 정보를 가져옵니다.
    return {
        cartItems: [
            {
                cart_item_id: "1",
                ebook_id: "1",
                title: "마크다운으로 배우는 프로그래밍",
                price: "15000",
            },
            {
                cart_item_id: "2",
                ebook_id: "2",
                title: "리액트 기초부터 고급까지",
                price: "20000",
            },
        ],
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에서 장바구니 항목을 삭제하거나 결제를 진행합니다.
    return { success: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "장바구니" },
        { name: "description", content: "장바구니에 담긴 상품을 확인하고 결제하세요" },
    ];
}

export default function CartPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { cartItems } = loaderData;
    const [discountCode, setDiscountCode] = useState("");

    // 총 금액 계산
    const totalPrice = cartItems.reduce(
        (sum: number, item: any) => sum + Number(item.price),
        0
    );

    // 할인 금액 (실제로는 서버에서 계산)
    const discountAmount = discountCode ? 5000 : 0;

    // 최종 결제 금액
    const finalPrice = totalPrice - discountAmount;

    const handleCheckout = () => {
        navigate("/purchases/checkout");
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/ebooks")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                전자책 목록으로 돌아가기
            </Button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">장바구니</h1>
            </div>

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-4 text-lg font-medium">장바구니가 비어있습니다</h2>
                    <p className="mt-2 text-gray-500">전자책을 장바구니에 추가해보세요.</p>
                    <Button className="mt-4" asChild>
                        <Link to="/ebooks">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            전자책 둘러보기
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>장바구니 상품 ({cartItems.length}개)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.cart_item_id}
                                        className="flex justify-between items-center p-4 border rounded-md"
                                    >
                                        <div>
                                            <h3 className="font-medium">{item.title}</h3>
                                            <p className="text-gray-600">
                                                {Number(item.price).toLocaleString()}원
                                            </p>
                                        </div>
                                        <Form method="post">
                                            <input
                                                type="hidden"
                                                name="action"
                                                value="remove_item"
                                            />
                                            <input
                                                type="hidden"
                                                name="cart_item_id"
                                                value={item.cart_item_id}
                                            />
                                            <Button
                                                type="submit"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </Form>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>주문 요약</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>상품 금액</span>
                                    <span>{totalPrice.toLocaleString()}원</span>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount-code">할인 코드</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="discount-code"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            placeholder="할인 코드 입력"
                                        />
                                        <Button variant="outline" type="button">
                                            적용
                                        </Button>
                                    </div>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>할인 금액</span>
                                        <span>-{discountAmount.toLocaleString()}원</span>
                                    </div>
                                )}

                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between font-bold">
                                        <span>총 결제 금액</span>
                                        <span>{finalPrice.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={handleCheckout}
                                    disabled={cartItems.length === 0}
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    결제하기
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
} 