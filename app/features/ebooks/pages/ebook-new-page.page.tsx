import { useEffect, useState, useRef } from "react";
import { Form, useNavigate, redirect, useActionData } from "react-router";
import { Button } from "~/common/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getServerClient } from "~/server";
import type { Route } from "./+types/ebook-new-page.page";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    FormStep,
    FORM_STEPS,
    ebookFormSchema,
    stepSchemas,
    basicInfoSchema,
    metadataSchema,
    STEP_NAMES
} from "../schemas/ebook-form.schema";
import type { EbookFormValues } from "../schemas/ebook-form.schema";
import { EbookFormStepper } from "../components/ebook-form-stepper";
import {
    BasicInfoStep,
    MetadataStep,
    PagesStep,
    SampleContentStep
} from "../components/ebook-form-steps";
import { validateFormData, parseFormData } from "~/common/utils/form-utils";

// 액션 데이터 타입 정의
interface ActionData {
    fieldErrors?: {
        form?: string;
        [key: string]: string | undefined;
    };
    step?: FormStep | null;
    success?: boolean;
    ebookId?: string;
    errors?: any;
    defaultValues?: Partial<EbookFormValues>;
}

export async function action({ request }: Route.ActionArgs): Promise<Response> {
    try {
        const { supabase, headers } = getServerClient(request);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return redirect("/auth/login", { headers });
        }

        // 폼 데이터 파싱 및 검증
        const formData = await request.formData();
        const formValues = await parseFormData<any>(formData);
        const resolver = zodResolver(ebookFormSchema);
        const { errors, data: validData } = await validateFormData<EbookFormValues>(formValues, resolver);

        // 유효성 검사 오류가 있으면 반환
        if (errors) {
            // 에러가 발생한 필드에 따라 현재 스텝 설정
            let currentStep: FormStep | null = null;

            for (const field in errors) {
                if (field in basicInfoSchema.shape) {
                    currentStep = FormStep.BASIC_INFO;
                    break;
                } else if (field in metadataSchema.shape) {
                    currentStep = FormStep.METADATA;
                    break;
                } else if (field === 'pages') {
                    currentStep = FormStep.PAGES;
                    break;
                } else if (field === 'sampleContent') {
                    currentStep = FormStep.SAMPLE_CONTENT;
                    break;
                }
            }

            // 에러 메시지 로깅
            console.error("유효성 검사 오류:", JSON.stringify(errors, null, 2));

            // 필드 에러를 사용자 친화적인 메시지로 변환
            const fieldErrors: Record<string, string> = {};
            Object.entries(errors).forEach(([field, error]) => {
                if (error && typeof error === 'object' && 'message' in error) {
                    // 오류 메시지를 사용자 친화적으로 변환
                    let errorMessage = (error as any).message;

                    // 타입 오류 메시지 개선
                    if ((error as any).type === 'invalid_type') {
                        if (errorMessage.includes('Expected string, received number')) {
                            errorMessage = '올바른 형식으로 입력해주세요.';
                        } else if (errorMessage.includes('Expected boolean, received string')) {
                            errorMessage = '올바른 형식으로 선택해주세요.';
                        } else {
                            errorMessage = '올바른 형식이 아닙니다.';
                        }
                    }

                    // 필수 필드 오류 메시지 개선
                    if ((error as any).type === 'too_small' && field === 'title') {
                        errorMessage = '제목을 입력해주세요.';
                    }

                    // 배열 관련 오류 메시지 개선
                    if (field === 'pages' && (error as any).type === 'too_small') {
                        errorMessage = '최소 한 개 이상의 페이지를 추가해주세요.';
                    }

                    fieldErrors[field] = errorMessage;
                }
            });

            return new Response(
                JSON.stringify({
                    errors,
                    fieldErrors,
                    defaultValues: formValues,
                    step: currentStep
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 400,
                }
            );
        }

        // 전자책 데이터 생성
        const ebookData = {
            user_id: user.id,
            title: validData.title,
            description: validData.description || "",
            price: validData.price ? Number(validData.price) : null,
            ebook_status: validData.status,
            page_count: validData.pages.length,
            reading_time: validData.readingTime ? Number(validData.readingTime) : null,
            language: validData.language,
            isbn: validData.isbn || null,
            is_featured: validData.isFeatured,
            publication_date: validData.publicationDate || null,
            cover_image_url: validData.coverImageUrl || null,
            sample_content: validData.sampleContent || ""
        };

        // Supabase에 전자책 정보 저장
        const { data: ebook, error } = await supabase
            .from("ebooks")
            .insert(ebookData)
            .select()
            .single();

        if (error) {
            console.error("전자책 생성 중 오류가 발생했습니다:", error);
            return new Response(
                JSON.stringify({
                    fieldErrors: {
                        form: "전자책 생성 중 오류가 발생했습니다."
                    },
                    step: FormStep.BASIC_INFO
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 500,
                }
            );
        }

        // 페이지 생성
        if (ebook && validData.pages.length > 0) {
            try {
                const formattedPages = validData.pages.map((page: any) => ({
                    ebook_id: ebook.ebook_id,
                    position: page.position,
                    title: page.title,
                    blocks: page.blocks,
                    page_number: page.position // 페이지 번호와 위치를 동일하게 설정
                }));

                const { error: pagesError } = await supabase
                    .from("ebook_pages")
                    .insert(formattedPages);

                if (pagesError) {
                    console.error("페이지 생성 중 오류가 발생했습니다:", pagesError);
                    return new Response(
                        JSON.stringify({
                            fieldErrors: {
                                pages: "페이지 생성 중 오류가 발생했습니다."
                            },
                            step: FormStep.PAGES,
                            ebookId: ebook.ebook_id
                        }),
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                            status: 500,
                        }
                    );
                }
            } catch (pageError) {
                console.error("페이지 생성 중 오류가 발생했습니다:", pageError);
                return new Response(
                    JSON.stringify({
                        fieldErrors: {
                            pages: "페이지 생성 중 오류가 발생했습니다."
                        },
                        step: FormStep.PAGES,
                        ebookId: ebook.ebook_id
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        status: 500,
                    }
                );
            }
        }

        return new Response(
            JSON.stringify({ success: true, ebookId: ebook?.ebook_id || "" }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Action 함수 실행 중 오류가 발생했습니다:", error);
        return new Response(
            JSON.stringify({
                fieldErrors: {
                    form: "서버 오류가 발생했습니다. 다시 시도해주세요."
                }
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 500,
            }
        );
    }
}

export function meta({ data }: Route.MetaArgs) {
    return [
        { title: "새 전자책 만들기" },
        { name: "description", content: "새로운 전자책을 만들어보세요" },
    ];
}

const EbookNewPage = () => {
    const navigate = useNavigate();
    const actionData = useActionData<ActionData>();
    const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
    const [isSaving, setIsSaving] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // 폼 설정
    const methods = useForm<EbookFormValues>({
        resolver: zodResolver(ebookFormSchema),
        defaultValues: actionData?.defaultValues || {
            title: "",
            description: "",
            price: 0,
            status: "draft",
            isFeatured: false,
            coverImageUrl: "",
            readingTime: 0,
            language: "ko",
            isbn: "",
            publicationDate: "",
            pages: [],
            sampleContent: ""
        },
        mode: "onChange"
    });

    const { trigger, getValues, formState, setError } = methods;

    // 액션 데이터 처리
    useEffect(() => {
        if (actionData) {
            // 필드 에러 설정
            if (actionData.fieldErrors) {
                Object.entries(actionData.fieldErrors).forEach(([field, message]) => {
                    if (field !== 'form' && message) {
                        setError(field as any, {
                            type: "server",
                            message
                        });
                    }
                });
            }

            // 스텝 이동
            if (actionData.step) {
                setCurrentStep(actionData.step);
            }

            // 성공 시 리다이렉트
            if (actionData.success && actionData.ebookId) {
                navigate(`/ebooks/${actionData.ebookId}`);
            }
        }
    }, [actionData, setError, navigate]);

    // 현재 스텝 검증
    const validateCurrentStep = async () => {
        const result = await trigger(Object.keys(stepSchemas[currentStep].shape) as any);
        return result;
    };

    // 다음 스텝으로 이동
    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            const currentIndex = FORM_STEPS.indexOf(currentStep);
            if (currentIndex < FORM_STEPS.length - 1) {
                setCurrentStep(FORM_STEPS[currentIndex + 1]);
                window.scrollTo(0, 0);
            }
        }
    };

    // 이전 스텝으로 이동
    const handlePrev = () => {
        const currentIndex = FORM_STEPS.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(FORM_STEPS[currentIndex - 1]);
            window.scrollTo(0, 0);
        }
    };

    // 폼 저장
    const handleSave = async () => {
        // 모든 스텝 검증
        let isValid = true;
        for (const step of FORM_STEPS) {
            const prevStep = currentStep;
            setCurrentStep(step);
            const isStepValid = await validateCurrentStep();
            if (!isStepValid) {
                // 유효하지 않은 단계로 이동
                setCurrentStep(step);
                isValid = false;
                break;
            }
            // 검증 후 원래 단계로 복원
            setCurrentStep(prevStep);
        }

        if (!isValid) return;
        setIsSaving(true);

        // 폼 제출
        if (formRef.current) {
            formRef.current.submit();
        }
    };

    // 현재 스텝의 다음 버튼 비활성화 여부
    const isNextDisabled = () => {
        switch (currentStep) {
            case FormStep.BASIC_INFO:
                // title 필드가 변경되었고 에러가 없는지 확인
                return !!formState.errors.title;
            case FormStep.PAGES:
                // pages 배열이 존재하고 비어있지 않은지 확인
                const pages = getValues("pages");
                return !pages || pages.length === 0;
            default:
                // 다른 스텝은 항상 다음으로 이동 가능
                return false;
        }
    };

    const isLastStep = currentStep === FORM_STEPS[FORM_STEPS.length - 1];

    return (
        <div className="container py-8">
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mr-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">새 전자책 만들기</h1>
            </div>

            {/* 서버 오류 메시지 표시 */}
            {actionData?.fieldErrors?.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{actionData.fieldErrors.form}</p>
                </div>
            )}

            <EbookFormStepper
                currentStep={currentStep}
                completedSteps={[]}
                onStepChange={setCurrentStep}
            />

            <FormProvider {...methods}>
                <Form
                    ref={formRef}
                    method="post"
                    encType="multipart/form-data"
                    className="space-y-8 mt-6"
                >
                    {/* 기본 정보 스텝 */}
                    {currentStep === FormStep.BASIC_INFO && (
                        <BasicInfoStep />
                    )}

                    {/* 메타데이터 스텝 */}
                    {currentStep === FormStep.METADATA && (
                        <MetadataStep />
                    )}

                    {/* 페이지 스텝 */}
                    {currentStep === FormStep.PAGES && (
                        <PagesStep />
                    )}

                    {/* 샘플 콘텐츠 스텝 */}
                    {currentStep === FormStep.SAMPLE_CONTENT && (
                        <SampleContentStep />
                    )}

                    {/* 폼 데이터 숨겨서 전송 */}
                    <input type="hidden" name="title" value={getValues("title")} />
                    <input type="hidden" name="description" value={getValues("description") || ""} />
                    <input type="hidden" name="price" value={getValues("price") || 0} />
                    <input type="hidden" name="status" value={getValues("status")} />
                    <input type="hidden" name="isFeatured" value={getValues("isFeatured") ? "on" : "off"} />
                    <input type="hidden" name="coverImageUrl" value={getValues("coverImageUrl") || ""} />
                    <input type="hidden" name="readingTime" value={getValues("readingTime") || 0} />
                    <input type="hidden" name="language" value={getValues("language")} />
                    <input type="hidden" name="isbn" value={getValues("isbn") || ""} />
                    <input type="hidden" name="publicationDate" value={getValues("publicationDate") || ""} />
                    <input type="hidden" name="pages" value={JSON.stringify(getValues("pages"))} />
                    <input type="hidden" name="sampleContent" value={getValues("sampleContent") || ""} />

                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentStep === FORM_STEPS[0]}
                        >
                            이전
                        </Button>

                        <div className="flex gap-2">
                            {isLastStep ? (
                                <Button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={handleSave}
                                >
                                    {isSaving ? "저장 중..." : "저장하기"}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={isNextDisabled()}
                                    className="flex items-center"
                                >
                                    다음
                                </Button>
                            )}
                        </div>
                    </div>
                </Form>
            </FormProvider>
        </div>
    );
};

export default EbookNewPage; 