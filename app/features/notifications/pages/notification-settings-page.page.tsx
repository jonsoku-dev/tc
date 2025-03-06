import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Switch } from "~/common/components/ui/switch";
import { Label } from "~/common/components/ui/label";
import { ArrowLeft, Bell, Save } from "lucide-react";
import { NOTIFICATION_TYPES } from "../constants";
import type { Route } from "./+types/notification-settings-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 사용자의 알림 설정을 가져옵니다.
    return {
        settings: {
            email_notifications: true,
            push_notifications: true,
            notification_preferences: {
                new_ebook: true,
                subscription_renewal: true,
                payment_reminder: true,
                payment_failure: true,
                special_offers: false,
            },
        },
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에 알림 설정을 저장합니다.
    return { success: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "알림 설정" },
        { name: "description", content: "알림 설정을 관리하세요" },
    ];
}

export default function NotificationSettingsPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { settings } = loaderData;

    const [emailNotifications, setEmailNotifications] = useState(settings.email_notifications);
    const [pushNotifications, setPushNotifications] = useState(settings.push_notifications);
    const [preferences, setPreferences] = useState(settings.notification_preferences);

    const handlePreferenceChange = (key: string) => {
        setPreferences({
            ...preferences,
            [key]: !preferences[key as keyof typeof preferences],
        });
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/notifications")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                알림 목록으로 돌아가기
            </Button>

            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">알림 설정</h1>

                <Form method="post" className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>알림 채널</CardTitle>
                            <CardDescription>
                                알림을 받을 방법을 선택하세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email-notifications">이메일 알림</Label>
                                    <p className="text-sm text-gray-500">
                                        중요한 알림을 이메일로 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    id="email-notifications"
                                    name="email_notifications"
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push-notifications">푸시 알림</Label>
                                    <p className="text-sm text-gray-500">
                                        앱이나 브라우저에서 푸시 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    id="push-notifications"
                                    name="push_notifications"
                                    checked={pushNotifications}
                                    onCheckedChange={setPushNotifications}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>알림 유형</CardTitle>
                            <CardDescription>
                                받고 싶은 알림 유형을 선택하세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="new-ebook">새 전자책 출시</Label>
                                    <p className="text-sm text-gray-500">
                                        새로운 전자책이 출시되면 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    id="new-ebook"
                                    name="notification_preferences.new_ebook"
                                    checked={preferences.new_ebook}
                                    onCheckedChange={() => handlePreferenceChange("new_ebook")}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="subscription-renewal">구독 갱신</Label>
                                    <p className="text-sm text-gray-500">
                                        구독이 갱신되면 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    id="subscription-renewal"
                                    name="notification_preferences.subscription_renewal"
                                    checked={preferences.subscription_renewal}
                                    onCheckedChange={() => handlePreferenceChange("subscription_renewal")}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="payment-reminder">결제 알림</Label>
                                    <p className="text-sm text-gray-500">
                                        결제 예정일 전에 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    id="payment-reminder"
                                    name="notification_preferences.payment_reminder"
                                    checked={preferences.payment_reminder}
                                    onCheckedChange={() => handlePreferenceChange("payment_reminder")}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="payment-failure">결제 실패</Label>
                                    <p className="text-sm text-gray-500">
                                        결제가 실패하면 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    id="payment-failure"
                                    name="notification_preferences.payment_failure"
                                    checked={preferences.payment_failure}
                                    onCheckedChange={() => handlePreferenceChange("payment_failure")}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="special-offers">특별 혜택</Label>
                                    <p className="text-sm text-gray-500">
                                        할인 및 특별 혜택에 대한 알림을 받습니다.
                                    </p>
                                </div>
                                <Switch
                                    id="special-offers"
                                    name="notification_preferences.special_offers"
                                    checked={preferences.special_offers}
                                    onCheckedChange={() => handlePreferenceChange("special_offers")}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="ml-auto">
                                <Save className="mr-2 h-4 w-4" />
                                설정 저장
                            </Button>
                        </CardFooter>
                    </Card>
                </Form>
            </div>
        </div>
    );
} 