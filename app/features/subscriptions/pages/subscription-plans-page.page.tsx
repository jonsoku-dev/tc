import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/common/components/ui/radio-group";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/subscription-plans-page.page";

export function loader({ params }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 구독 플랜 정보를 가져옵니다.
    const planId = params.planId || "2"; // 기본값으로 프리미엄 플랜

    const plans = {
        "1": {
            plan_id: "1",
            name: "기본 플랜",
            price: "9900",
            features: [
                "모든 전자책 무제한 열람",
                "월 3권 다운로드",
                "기본 지원",
            ],
            description: "전자책을 가끔 읽는 분들을 위한 합리적인 가격의 기본 플랜입니다.",
        },
        "2": {
            plan_id: "2",
            name: "프리미엄 플랜",
            price: "19900",
            features: [
                "모든 전자책 무제한 열람",
                "월 10권 다운로드",
                "우선 지원",
                "신규 콘텐츠 우선 접근",
            ],
            description: "더 많은 전자책을 다운로드하고 싶은 분들을 위한 프리미엄 플랜입니다.",
        },
        "3": {
            plan_id: "3",
            name: "프로 플랜",
            price: "29900",
            features: [
                "모든 전자책 무제한 열람",
                "무제한 다운로드",
                "24/7 프리미엄 지원",
                "신규 콘텐츠 우선 접근",
                "오프라인 이벤트 초대",
            ],
            description: "전자책을 자주 읽고 모든 혜택을 누리고 싶은 분들을 위한 프로 플랜입니다.",
        },
    };

    return {
        plan: plans[planId as keyof typeof plans] || plans["2"],
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에 구독 정보를 저장합니다.
    return { success: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: `${data.plan.name} 구독` },
        { name: "description", content: data.plan.description },
    ];
}

export default function SubscriptionPlansPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { plan } = loaderData;
    const [paymentType, setPaymentType] = useState("credit_card");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvc, setCardCvc] = useState("");
    const [cardName, setCardName] = useState("");

    // 폼 제출 후 리디렉션
    if (actionData?.success) {
        navigate("/subscriptions/my");
    }

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

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCardNumber(e.target.value);
        setCardNumber(formattedValue);
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/subscriptions")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                구독 플랜 목록으로 돌아가기
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">결제 정보</CardTitle>
                            <CardDescription>
                                {plan.name} 구독을 위한 결제 정보를 입력해주세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form method="post" className="space-y-6">
                                <input type="hidden" name="plan_id" value={plan.plan_id} />

                                <div className="space-y-4">
                                    <div>
                                        <Label>결제 수단</Label>
                                        <RadioGroup
                                            value={paymentType}
                                            onValueChange={setPaymentType}
                                            className="mt-2 space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="credit_card" id="payment-credit-card" />
                                                <Label htmlFor="payment-credit-card" className="cursor-pointer">
                                                    신용카드
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="bank_transfer" id="payment-bank-transfer" />
                                                <Label htmlFor="payment-bank-transfer" className="cursor-pointer">
                                                    계좌이체
                                                </Label>
                                            </div>
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
                                                        onChange={(e) => setCardExpiry(e.target.value)}
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
                                                * 입금 후 자동으로 구독이 활성화됩니다.
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
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>
                                <span className="text-2xl font-bold">
                                    {Number(plan.price).toLocaleString()}원
                                </span>
                                <span className="text-gray-500"> / 월</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-gray-600">{plan.description}</p>
                            <div className="space-y-3">
                                <p className="font-medium">포함 혜택:</p>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" form="subscription-form">
                                <CreditCard className="mr-2 h-4 w-4" />
                                {Number(plan.price).toLocaleString()}원 구독하기
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="mt-4 text-sm text-gray-600">
                        <p>* 구독은 매월 자동 갱신되며, 언제든지 해지할 수 있습니다.</p>
                        <p>* 첫 결제 후 7일 이내에 해지 시 전액 환불됩니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 