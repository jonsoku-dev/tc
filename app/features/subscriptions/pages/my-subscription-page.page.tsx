import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/common/components/ui/dialog";
import { ArrowLeft, CreditCard, Calendar, AlertTriangle, Check } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/my-subscription-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 사용자의 구독 정보를 가져옵니다.
    return {
        subscription: {
            subscription_id: "sub_123456",
            plan_id: "2",
            plan_name: "프리미엄 플랜",
            price: "19900",
            status: "active",
            next_billing_date: "2023-05-15",
            start_date: "2023-04-15",
            payment_method: {
                type: "credit_card",
                last4: "1234",
                expiry: "12/25",
            },
            features: [
                "모든 전자책 무제한 열람",
                "월 10권 다운로드",
                "우선 지원",
                "신규 콘텐츠 우선 접근",
            ],
        },
        invoices: [
            {
                invoice_id: "inv_001",
                amount: "19900",
                date: "2023-04-15",
                status: "paid",
            },
            {
                invoice_id: "inv_002",
                amount: "19900",
                date: "2023-03-15",
                status: "paid",
            },
            {
                invoice_id: "inv_003",
                amount: "19900",
                date: "2023-02-15",
                status: "paid",
            },
        ],
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에서 구독 상태를 변경합니다.
    return { success: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "내 구독 관리" },
        { name: "description", content: "구독 정보를 확인하고 관리하세요" },
    ];
}

export default function MySubscriptionPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { subscription, invoices } = loaderData;
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "활성";
            case "paused":
                return "일시정지";
            case "cancelled":
                return "해지";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "paused":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
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
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">{subscription.plan_name}</CardTitle>
                                    <CardDescription>
                                        월 {Number(subscription.price).toLocaleString()}원
                                    </CardDescription>
                                </div>
                                <Badge className={getStatusColor(subscription.status)}>
                                    {getStatusText(subscription.status)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">구독 시작일</p>
                                    <p className="font-medium">{formatDate(subscription.start_date)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">다음 결제일</p>
                                    <p className="font-medium">{formatDate(subscription.next_billing_date)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="font-medium mb-2">포함 혜택:</p>
                                <ul className="space-y-2">
                                    {subscription.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="font-medium mb-2">결제 정보:</p>
                                <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                                    <span>
                                        {subscription.payment_method.type === "credit_card" ? "신용카드" : "계좌이체"} (
                                        {subscription.payment_method.last4})
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" asChild>
                                <Link to={`/subscriptions/plans/${subscription.plan_id}/change`}>
                                    플랜 변경
                                </Link>
                            </Button>

                            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="text-red-500">
                                        구독 해지
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>구독을 해지하시겠습니까?</DialogTitle>
                                        <DialogDescription>
                                            구독을 해지하면 다음 결제일({formatDate(subscription.next_billing_date)})까지 서비스를 이용할 수 있으며, 이후에는 모든 혜택이 중단됩니다.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="p-4 bg-yellow-50 rounded-md flex items-start">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 shrink-0" />
                                        <p className="text-sm text-yellow-700">
                                            해지 후에도 언제든지 다시 구독할 수 있습니다. 해지 전에 혜택을 모두 사용하는 것을 권장합니다.
                                        </p>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                                            취소
                                        </Button>
                                        <Form method="post">
                                            <input type="hidden" name="action" value="cancel_subscription" />
                                            <input type="hidden" name="subscription_id" value={subscription.subscription_id} />
                                            <Button type="submit" variant="destructive">
                                                구독 해지 확인
                                            </Button>
                                        </Form>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>결제 내역</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <p className="text-gray-500">결제 내역이 없습니다.</p>
                            ) : (
                                <div className="space-y-4">
                                    {invoices.map((invoice) => (
                                        <div key={invoice.invoice_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                            <div>
                                                <p className="font-medium">{formatDate(invoice.date)}</p>
                                                <p className="text-sm text-gray-600">{Number(invoice.amount).toLocaleString()}원</p>
                                            </div>
                                            <Badge className={invoice.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                                {invoice.status === "paid" ? "결제완료" : "대기중"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>구독 관리 도움말</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-1">구독 해지</h3>
                                <p className="text-sm text-gray-600">
                                    구독을 해지해도 다음 결제일까지 서비스를 이용할 수 있습니다. 언제든지 다시 구독할 수 있습니다.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">플랜 변경</h3>
                                <p className="text-sm text-gray-600">
                                    플랜을 변경하면 즉시 새로운 플랜이 적용되며, 남은 기간에 대한 금액은 일할 계산됩니다.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">결제 정보 변경</h3>
                                <p className="text-sm text-gray-600">
                                    결제 정보를 변경하려면 고객센터로 문의해주세요.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/help/subscriptions">
                                    자세한 도움말 보기
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
} 