import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { Bell, Check, Trash, Settings } from "lucide-react";
import { Link } from "react-router";
import { NOTIFICATION_TYPES } from "../constants";
import type { Route } from "./+types/notifications-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 알림 목록을 가져옵니다.
    return {
        notifications: [
            {
                notification_id: "1",
                type: "info",
                content: "새로운 전자책 '마크다운으로 배우는 프로그래밍'이 출시되었습니다.",
                is_read: false,
                created_at: "2023-04-15T10:30:00Z",
            },
            {
                notification_id: "2",
                type: "info",
                content: "구독 플랜이 성공적으로 갱신되었습니다.",
                is_read: true,
                created_at: "2023-04-10T08:15:00Z",
            },
            {
                notification_id: "3",
                type: "warning",
                content: "결제 정보를 업데이트해주세요. 다음 결제일: 2023-05-01",
                is_read: false,
                created_at: "2023-04-05T14:20:00Z",
            },
            {
                notification_id: "4",
                type: "error",
                content: "결제가 실패했습니다. 결제 정보를 확인해주세요.",
                is_read: false,
                created_at: "2023-04-01T09:45:00Z",
            },
            {
                notification_id: "5",
                type: "info",
                content: "새로운 전자책 '리액트 기초부터 고급까지'가 출시되었습니다.",
                is_read: true,
                created_at: "2023-03-25T11:10:00Z",
            },
        ],
    };
}

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에서 알림을 읽음 처리하거나 삭제합니다.
    return { success: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "알림" },
        { name: "description", content: "알림 목록을 확인하세요" },
    ];
}

export default function NotificationsPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { notifications } = loaderData;
    const [activeTab, setActiveTab] = useState("all");

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "오늘";
        } else if (diffDays === 1) {
            return "어제";
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case "info":
                return "정보";
            case "warning":
                return "주의";
            case "error":
                return "오류";
            default:
                return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "info":
                return "bg-blue-100 text-blue-800";
            case "warning":
                return "bg-yellow-100 text-yellow-800";
            case "error":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const filteredNotifications = notifications.filter((notification) => {
        if (activeTab === "all") return true;
        if (activeTab === "unread") return !notification.is_read;
        return notification.type === activeTab;
    });

    const unreadCount = notifications.filter((notification) => !notification.is_read).length;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">알림</h1>
                <Button variant="outline" asChild>
                    <Link to="/notifications/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        알림 설정
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="all">
                        전체
                        {unreadCount > 0 && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800">{unreadCount}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="unread">읽지 않음</TabsTrigger>
                    <TabsTrigger value="info">정보</TabsTrigger>
                    <TabsTrigger value="warning">주의</TabsTrigger>
                    <TabsTrigger value="error">오류</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-lg font-medium">알림이 없습니다</h2>
                            <p className="mt-2 text-gray-500">
                                {activeTab === "all"
                                    ? "아직 알림이 없습니다."
                                    : activeTab === "unread"
                                        ? "읽지 않은 알림이 없습니다."
                                        : `${getTypeText(activeTab)} 유형의 알림이 없습니다.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNotifications.map((notification) => (
                                <Card
                                    key={notification.notification_id}
                                    className={notification.is_read ? "bg-white" : "bg-blue-50"}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <Badge className={getTypeColor(notification.type)}>
                                                        {getTypeText(notification.type)}
                                                    </Badge>
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                </div>
                                                <p className={notification.is_read ? "text-gray-700" : "font-medium"}>
                                                    {notification.content}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                {!notification.is_read && (
                                                    <Form method="post" className="inline">
                                                        <input type="hidden" name="action" value="mark_as_read" />
                                                        <input
                                                            type="hidden"
                                                            name="notification_id"
                                                            value={notification.notification_id}
                                                        />
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-500"
                                                            title="읽음으로 표시"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    </Form>
                                                )}
                                                <Form method="post" className="inline">
                                                    <input type="hidden" name="action" value="delete_notification" />
                                                    <input
                                                        type="hidden"
                                                        name="notification_id"
                                                        value={notification.notification_id}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500"
                                                        title="삭제"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </Form>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {filteredNotifications.length > 0 && (
                <div className="mt-6 flex justify-between">
                    <Form method="post">
                        <input type="hidden" name="action" value="mark_all_as_read" />
                        <Button type="submit" variant="outline">
                            <Check className="mr-2 h-4 w-4" />
                            모두 읽음으로 표시
                        </Button>
                    </Form>
                    <Form method="post">
                        <input type="hidden" name="action" value="delete_all" />
                        <Button type="submit" variant="outline" className="text-red-500">
                            <Trash className="mr-2 h-4 w-4" />
                            모두 삭제
                        </Button>
                    </Form>
                </div>
            )}
        </div>
    );
} 