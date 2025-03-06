import { useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { PlusCircle, MessageSquare, Edit, Trash } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/interviews-page.page";

export function loader({ request }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 인터뷰 목록을 가져옵니다.
    return {
        interviews: [
            {
                interview_id: "1",
                title: "프로그래밍 경험 인터뷰",
                description: "개발자로서의 경험과 노하우를 공유하는 인터뷰",
                question_count: 10,
                created_at: "2023-03-01",
            },
            {
                interview_id: "2",
                title: "디자인 시스템 인터뷰",
                description: "디자인 시스템 구축 경험에 대한 인터뷰",
                question_count: 8,
                created_at: "2023-03-15",
            },
            {
                interview_id: "3",
                title: "프로젝트 관리 인터뷰",
                description: "효율적인 프로젝트 관리 방법에 대한 인터뷰",
                question_count: 12,
                created_at: "2023-04-01",
            },
        ],
    };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "인터뷰 목록" },
        { name: "description", content: "AI 기반 인터뷰 콘텐츠 목록을 관리하세요" },
    ];
}

export default function InterviewsPage({ loaderData }: Route.ComponentProps) {
    const { interviews } = loaderData;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">인터뷰 목록</h1>
                <Button asChild>
                    <Link to="/interviews/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        새 인터뷰 만들기
                    </Link>
                </Button>
            </div>

            {interviews.length === 0 ? (
                <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-4 text-lg font-medium">인터뷰가 없습니다</h2>
                    <p className="mt-2 text-gray-500">새 인터뷰를 만들어 시작하세요.</p>
                    <Button className="mt-4" asChild>
                        <Link to="/interviews/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            새 인터뷰 만들기
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviews.map((interview) => (
                        <Card key={interview.interview_id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{interview.title}</CardTitle>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        질문 {interview.question_count}개
                                    </Badge>
                                </div>
                                <CardDescription>{interview.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    생성일: {new Date(interview.created_at).toLocaleDateString()}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" asChild>
                                    <Link to={`/interviews/${interview.interview_id}`}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        보기
                                    </Link>
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" asChild>
                                        <Link to={`/interviews/${interview.interview_id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-red-500">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 