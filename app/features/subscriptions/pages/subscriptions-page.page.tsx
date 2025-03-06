import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/subscriptions-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 구독 플랜 정보를 가져옵니다.
    return {
        subscriptionPlans: [
            {
                plan_id: "1",
                name: "기본 플랜",
                price: "9900",
                features: [
                    "모든 전자책 무제한 열람",
                    "월 3권 다운로드",
                    "기본 지원",
                ],
                is_popular: false,
            },
            {
                plan_id: "2",
                name: "프리미엄 플랜",
                price: "19900",
                features: [
                    "모든 전자책 무제한 열람",
                    "월 10권 다운로드",
                    "우선 지원",
                    "신규 콘텐츠 우선 접근",
                ],
                is_popular: true,
            },
            {
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
                is_popular: false,
            },
        ],
        currentSubscription: null, // 사용자가 구독 중인 플랜이 없는 경우
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "구독 플랜" },
        { name: "description", content: "다양한 구독 플랜을 확인하고 가입하세요" },
    ];
}

export default function SubscriptionsPage({ loaderData }: Route.ComponentProps) {
    const { subscriptionPlans, currentSubscription } = loaderData;

    return (
        <div className="container mx-auto py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">구독 플랜</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    월 구독으로 모든 전자책을 무제한으로 이용하세요. 언제든지 해지 가능합니다.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {subscriptionPlans.map((plan) => (
                    <Card
                        key={plan.plan_id}
                        className={`relative ${plan.is_popular ? 'border-blue-500 shadow-lg' : ''}`}
                    >
                        {plan.is_popular && (
                            <Badge className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2 bg-blue-500">
                                인기 플랜
                            </Badge>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>
                                <span className="text-3xl font-bold">
                                    {Number(plan.price).toLocaleString()}원
                                </span>
                                <span className="text-gray-500"> / 월</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {/* {currentSubscription && currentSubscription.plan_id === plan.plan_id ? (
                                <Button className="w-full" disabled>
                                    현재 이용 중
                                </Button>
                            ) : (
                                <Button className="w-full" asChild>
                                    <Link to={`/subscriptions/plans/${plan.plan_id}`}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        구독하기
                                    </Link>
                                </Button>
                            )} */}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">
                    이미 구독 중이신가요?
                </p>
                <Button variant="outline" asChild>
                    <Link to="/subscriptions/my">
                        내 구독 관리
                    </Link>
                </Button>
            </div>
        </div>
    );
} 