import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";
import { ArrowLeft, MessageSquare, Save, Sparkles } from "lucide-react";
import type { Route } from "./+types/interview-detail-page.page";

export function loader({ params }: Route.LoaderArgs) {
    // 실제 구현에서는 Supabase에서 인터뷰 정보를 가져옵니다.
    return {
        interview: {
            interview_id: params.interviewId,
            title: "프로그래밍 경험 인터뷰",
            description: "개발자로서의 경험과 노하우를 공유하는 인터뷰입니다.",
            questions: [
                {
                    question_id: "q1",
                    content: "프로그래밍을 시작하게 된 계기는 무엇인가요?",
                    is_required: true,
                    question_type: "text",
                },
                {
                    question_id: "q2",
                    content: "가장 도전적이었던 프로젝트는 무엇이었나요?",
                    is_required: true,
                    question_type: "text",
                },
                {
                    question_id: "q3",
                    content: "주로 사용하는 프로그래밍 언어는 무엇인가요?",
                    is_required: false,
                    question_type: "text",
                },
                {
                    question_id: "q4",
                    content: "개발자로서 성장하기 위해 어떤 노력을 하고 있나요?",
                    is_required: true,
                    question_type: "text",
                },
                {
                    question_id: "q5",
                    content: "후배 개발자들에게 해주고 싶은 조언이 있다면?",
                    is_required: false,
                    question_type: "text",
                },
            ],
            answers: [],
        },
    };
}

export function action({ request, params }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에 인터뷰 답변을 저장합니다.
    return { success: true, interviewId: params.interviewId, generated: true };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: data.interview.title },
        { name: "description", content: data.interview.description },
    ];
}

export default function InterviewDetailPage({ loaderData, actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { interview } = loaderData;
    const [answers, setAnswers] = useState(
        interview.questions.map((q) => ({ question_id: q.question_id, answer_content: "" }))
    );
    const [activeTab, setActiveTab] = useState("questions");
    const [generatedContent, setGeneratedContent] = useState("");

    // 폼 제출 후 생성된 콘텐츠가 있으면 표시
    if (actionData?.generated && !generatedContent) {
        setGeneratedContent(`
# ${interview.title} - 인터뷰 내용

${interview.description}

## 프로그래밍 여정

인터뷰이는 어릴 때부터 컴퓨터에 관심이 많았다고 합니다. 고등학교 시절 우연히 접한 프로그래밍 수업을 통해 코딩의 매력에 빠져들게 되었고, 이후 컴퓨터 공학을 전공하게 되었습니다.

## 도전적인 프로젝트 경험

가장 도전적이었던 프로젝트로는 대규모 실시간 데이터 처리 시스템을 구축했던 경험을 꼽았습니다. 수많은 사용자의 데이터를 실시간으로 처리하고 분석해야 했기 때문에 성능 최적화와 안정성 확보가 매우 중요했다고 합니다.

## 성장을 위한 노력

인터뷰이는 지속적인 학습을 위해 다음과 같은 노력을 하고 있다고 합니다:

1. 매일 1시간 이상 새로운 기술 학습하기
2. 오픈 소스 프로젝트에 기여하기
3. 기술 컨퍼런스 참여 및 발표
4. 개발 블로그 운영

## 후배 개발자들을 위한 조언

"기술은 계속 변화하지만, 문제 해결 능력과 학습 능력은 변하지 않습니다. 특정 언어나 프레임워크에 집착하기보다는 기본기를 탄탄히 다지고, 새로운 것을 배우는 것을 두려워하지 마세요."
    `);
        setActiveTab("generated");
    }

    const updateAnswer = (questionId: string, content: string) => {
        setAnswers(
            answers.map((a) =>
                a.question_id === questionId ? { ...a, answer_content: content } : a
            )
        );
    };

    const isFormValid = () => {
        return interview.questions
            .filter((q) => q.is_required)
            .every((q) => {
                const answer = answers.find((a) => a.question_id === q.question_id);
                return answer && answer.answer_content.trim() !== "";
            });
    };

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/interviews")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                인터뷰 목록으로 돌아가기
            </Button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">{interview.title}</h1>
                <p className="mt-2 text-gray-600">{interview.description}</p>
            </div>

            <Tabs defaultValue="questions" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="questions">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        질문 및 답변
                    </TabsTrigger>
                    <TabsTrigger value="generated" disabled={!generatedContent}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        생성된 콘텐츠
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="questions">
                    <Form method="post" className="space-y-6">
                        {interview.questions.map((question, index) => (
                            <Card key={question.question_id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-start">
                                        <span className="mr-2">Q{index + 1}.</span>
                                        <span>{question.content}</span>
                                        {question.is_required && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        id={`answer-${question.question_id}`}
                                        name={`answers[${question.question_id}]`}
                                        value={
                                            answers.find((a) => a.question_id === question.question_id)
                                                ?.answer_content || ""
                                        }
                                        onChange={(e) => updateAnswer(question.question_id, e.target.value)}
                                        placeholder="답변을 입력하세요"
                                        rows={4}
                                        required={question.is_required}
                                    />
                                </CardContent>
                            </Card>
                        ))}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={!isFormValid()}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                AI로 콘텐츠 생성하기
                            </Button>
                        </div>
                    </Form>
                </TabsContent>

                <TabsContent value="generated">
                    {generatedContent ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI로 생성된 콘텐츠</CardTitle>
                                <CardDescription>
                                    인터뷰 답변을 바탕으로 AI가 생성한 콘텐츠입니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                                        {generatedContent}
                                    </pre>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-4">
                                <Button variant="outline">
                                    <Save className="mr-2 h-4 w-4" />
                                    전자책으로 저장
                                </Button>
                                <Button onClick={() => setActiveTab("questions")}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    답변 수정하기
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <div className="text-center py-12">
                            <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
                            <h2 className="mt-4 text-lg font-medium">생성된 콘텐츠가 없습니다</h2>
                            <p className="mt-2 text-gray-500">
                                모든 필수 질문에 답변한 후 "AI로 콘텐츠 생성하기" 버튼을 클릭하세요.
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
} 