import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/common/components/ui/radio-group";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { PAYMENT_TYPES } from "../constants";
import type { Route } from "./+types/checkout-page.page";

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
        totalPrice: 35000,
        discountAmount: 5000,
        finalPrice: 30000,
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에 결제 정보를 저장하고 결제를 처리합니다.
    return { success: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "결제하기" },
        { name: "description", content: "결제 정보를 입력하고 결제를 완료하세요" },
    ];
}

export default function CheckoutPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { cartItems, totalPrice, discountAmount, finalPrice } = loaderData;
    const [paymentType, setPaymentType] = useState("credit_card");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvc, setCardCvc] = useState("");
    const [cardName, setCardName] = useState("");

    // 폼 제출 후 리디렉션
    if (actionData?.success) {
        navigate("/purchases/success");
    }

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

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(" ");
        } else {
            return value;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }

        return v;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCardNumber(e.target.value);
        setCardNumber(formattedValue);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatExpiry(e.target.value);
        setCardExpiry(formattedValue);
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/purchases/cart")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                장바구니로 돌아가기
            </Button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">결제하기</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>결제 정보</CardTitle>
                            <CardDescription>
                                안전한 결제를 위해 정보를 입력해주세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form method="post" className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label>결제 수단</Label>
                                        <RadioGroup
                                            value={paymentType}
                                            onValueChange={setPaymentType}
                                            className="mt-2 space-y-2"
                                        >
                                            {PAYMENT_TYPES.map((type) => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={type} id={`payment-${type}`} />
                                                    <Label htmlFor={`payment-${type}`} className="cursor-pointer">
                                                        {getPaymentTypeText(type)}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    {paymentType === "credit_card" && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="card-number">카드 번호</Label>
                                                <Input
                                                    id="card-number"
                                                    name="card-number"
                                                    value={cardNumber}
                                                    onChange={handleCardNumberChange}
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength={19}
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="card-expiry">만료일 (MM/YY)</Label>
                                                    <Input
                                                        id="card-expiry"
                                                        name="card-expiry"
                                                        value={cardExpiry}
                                                        onChange={handleExpiryChange}
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="card-cvc">CVC</Label>
                                                    <Input
                                                        id="card-cvc"
                                                        name="card-cvc"
                                                        value={cardCvc}
                                                        onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ""))}
                                                        placeholder="123"
                                                        maxLength={3}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="card-name">카드 소유자 이름</Label>
                                                <Input
                                                    id="card-name"
                                                    name="card-name"
                                                    value={cardName}
                                                    onChange={(e) => setCardName(e.target.value)}
                                                    placeholder="홍길동"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentType === "bank_transfer" && (
                                        <div className="p-4 bg-gray-50 rounded-md">
                                            <p className="font-medium">계좌 정보</p>
                                            <p className="mt-2">은행: 신한은행</p>
                                            <p>계좌번호: 110-123-456789</p>
                                            <p>예금주: (주)전자책 서비스</p>
                                            <p className="mt-4 text-sm text-gray-600">
                                                * 입금 후 자동으로 주문이 처리됩니다.
                                            </p>
                                        </div>
                                    )}

                                    {paymentType === "paypal" && (
                                        <div className="p-4 bg-gray-50 rounded-md">
                                            <p className="font-medium">PayPal 결제</p>
                                            <p className="mt-2 text-sm text-gray-600">
                                                결제하기 버튼을 클릭하면 PayPal 결제 페이지로 이동합니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>주문 요약</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium mb-2">주문 상품 ({cartItems.length}개)</p>
                                {cartItems.map((item) => (
                                    <div key={item.cart_item_id} className="flex justify-between text-sm py-1">
                                        <span>{item.title}</span>
                                        <span>{Number(item.price).toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span>상품 금액</span>
                                    <span>{totalPrice.toLocaleString()}원</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 mt-2">
                                        <span>할인 금액</span>
                                        <span>-{discountAmount.toLocaleString()}원</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold mt-4">
                                    <span>총 결제 금액</span>
                                    <span>{finalPrice.toLocaleString()}원</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" form="checkout-form">
                                <CreditCard className="mr-2 h-4 w-4" />
                                {finalPrice.toLocaleString()}원 결제하기
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
} 