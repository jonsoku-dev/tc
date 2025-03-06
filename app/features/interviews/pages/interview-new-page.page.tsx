import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import { Label } from "~/common/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/common/components/ui/card";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { INTERVIEW_QUESTION_TYPES } from "../constants";
import type { Route } from "./+types/interview-new-page.page";

export function action({ request }: Route.ActionArgs) {
    // 실제 구현에서는 Supabase에 인터뷰 정보를 저장합니다.
    return { success: true, interviewId: "new-interview-id" };
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "새 인터뷰 만들기" },
        { name: "description", content: "새로운 인터뷰를 만들어보세요" },
    ];
}

export default function InterviewNewPage({ actionData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([
        { content: "", is_required: true, question_type: "text" }
    ]);

    // 폼 제출 후 리디렉션
    if (actionData?.success) {
        navigate(`/interviews/${actionData.interviewId}`);
    }

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { content: "", is_required: true, question_type: "text" }
        ]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setQuestions(updatedQuestions);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            const updatedQuestions = [...questions];
            updatedQuestions.splice(index, 1);
            setQuestions(updatedQuestions);
        }
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

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">새 인터뷰 만들기</CardTitle>
                    <CardDescription>
                        인터뷰 제목과 설명을 입력하고, 질문을 추가하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form method="post" className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">제목</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="인터뷰 제목을 입력하세요"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">설명</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="인터뷰에 대한 간단한 설명을 입력하세요"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">질문 목록</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    질문 추가
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {questions.map((question, index) => (
                                    <Card key={index}>
                                        <CardHeader className="py-3">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-base">질문 {index + 1}</CardTitle>
                                                {questions.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 h-8 px-2"
                                                        onClick={() => removeQuestion(index)}
                                                    >
                                                        삭제
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="py-3">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`question-${index}`}>질문 내용</Label>
                                                    <Textarea
                                                        id={`question-${index}`}
                                                        name={`questions[${index}].content`}
                                                        value={question.content}
                                                        onChange={(e) => updateQuestion(index, "content", e.target.value)}
                                                        placeholder="질문 내용을 입력하세요"
                                                        rows={2}
                                                        required
                                                    />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`required-${index}`}
                                                        name={`questions[${index}].is_required`}
                                                        checked={question.is_required}
                                                        onChange={(e) => updateQuestion(index, "is_required", e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <Label htmlFor={`required-${index}`} className="text-sm">필수 질문</Label>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`type-${index}`}>질문 유형</Label>
                                                    <select
                                                        id={`type-${index}`}
                                                        name={`questions[${index}].question_type`}
                                                        value={question.question_type}
                                                        onChange={(e) => updateQuestion(index, "question_type", e.target.value)}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    >
                                                        {INTERVIEW_QUESTION_TYPES.map((type) => (
                                                            <option key={type} value={type}>
                                                                {type === "text" ? "텍스트" :
                                                                    type === "multiple_choice" ? "객관식" : "평가"}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" form="new-interview-form">
                        <Save className="mr-2 h-4 w-4" />
                        저장하기
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
} 