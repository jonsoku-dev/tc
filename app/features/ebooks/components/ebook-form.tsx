import { useEffect, useRef, useState } from "react";
import { Form, useNavigate } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/common/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/common/components/ui/tabs";

import { EbookFormStepper } from "./ebook-form-stepper";
import {
    BasicInfoStep,
    MetadataStep,
    PagesStep,
    SampleContentStep
} from "./ebook-form-steps";
import type { PageItem } from "../machines/ebook-form.machine";
import type { EbookFormValues } from "../schemas/ebook-form.schema";
import {
    ebookFormSchema,
    FORM_STEPS,
    FormStep,
    stepSchemas
} from "../schemas/ebook-form.schema";

interface EbookFormProps {
    mode: 'new' | 'edit';
    initialData?: any;
    actionData?: any;
    onSubmit?: (data: any) => void;
    title?: string;
}

// 초기 데이터 변환 함수
function formatInitialData(initialData: any): Partial<EbookFormValues> {
    console.log("[formatInitialData] 시작:", initialData ? "데이터 있음" : "데이터 없음");

    if (!initialData) return {};

    const formattedData: Partial<EbookFormValues> = {};

    if (initialData.ebook) {
        console.log("[formatInitialData] 전자책 데이터:", {
            id: initialData.ebook.ebook_id,
            title: initialData.ebook.title,
            status: initialData.ebook.ebook_status,
            pagesCount: initialData.ebook.pages?.length || 0
        });

        const ebook = initialData.ebook;
        formattedData.title = ebook.title || "";
        formattedData.description = ebook.description || "";
        formattedData.price = ebook.price !== null ? ebook.price : 0;
        formattedData.status = ebook.ebook_status || "draft";
        formattedData.isFeatured = ebook.is_featured || false;
        formattedData.coverImageUrl = ebook.cover_image_url || "";
        formattedData.readingTime = ebook.reading_time !== null ? ebook.reading_time : 0;
        formattedData.language = ebook.language || "ko";
        formattedData.isbn = ebook.isbn || "";
        formattedData.publicationDate = ebook.publication_date || "";
        formattedData.sampleContent = ebook.sample_content || "";

        // 페이지 데이터 포맷팅
        if (ebook.pages && ebook.pages.length > 0) {
            console.log("[formatInitialData] 페이지 데이터 포맷팅:", ebook.pages.length);
            formattedData.pages = ebook.pages.map((page: any) => ({
                id: `page-id-${page.page_id}`,
                title: page.title || `페이지 ${page.page_number || page.position}`,
                blocks: Array.isArray(page.blocks) ? page.blocks : [],
                position: page.position || page.page_number || 0
            }));
        } else {
            formattedData.pages = [];
        }
    }

    console.log("[formatInitialData] 결과:", {
        title: formattedData.title,
        status: formattedData.status,
        pagesCount: formattedData.pages?.length || 0
    });

    return formattedData;
}

// 액션 데이터 처리 컴포넌트
function ActionDataHandler({
    actionData,
    isEditMode,
    setError,
    setCurrentStep,
    navigate
}: {
    actionData: any;
    isEditMode: boolean;
    setError: any;
    setCurrentStep: (step: FormStep) => void;
    navigate: any;
}) {
    useEffect(() => {
        if (!actionData) return;

        console.log("[ActionDataHandler] 액션 데이터:", actionData);
        console.log("[ActionDataHandler] 액션 데이터 타입:", typeof actionData);

        if (typeof actionData === 'object') {
            console.log("[ActionDataHandler] 액션 데이터 키:", Object.keys(actionData));

            if ('status' in actionData) {
                console.log("[ActionDataHandler] 액션 데이터 상태 코드:", actionData.status);
            }
        }

        // 필드 에러 설정
        if (actionData.fieldErrors) {
            console.log("[ActionDataHandler] 필드 에러:", actionData.fieldErrors);
            Object.entries(actionData.fieldErrors).forEach(([field, message]) => {
                if (field !== 'form' && message) {
                    console.log(`[ActionDataHandler] 필드 에러 설정: ${field} = ${message}`);
                    setError(field as any, {
                        type: "server",
                        message: message as string
                    });
                }
            });
        }

        // 스텝 이동 (new 모드)
        if (!isEditMode && actionData.step) {
            console.log(`[ActionDataHandler] 스텝 이동: ${actionData.step}`);
            setCurrentStep(actionData.step);
        }

        // 성공 시 처리
        if (actionData.success) {
            console.log(`[ActionDataHandler] 성공 처리: ${JSON.stringify(actionData)}`);
            if (actionData.ebookId) {
                toast("저장 완료", {
                    description: "전자책 정보가 성공적으로 저장되었습니다.",
                });

                // 새 전자책 생성 후 상세 페이지로 이동
                if (!isEditMode) {
                    console.log(`[ActionDataHandler] 새 전자책 페이지로 이동: /ebooks/${actionData.ebookId}`);
                    navigate(`/ebooks/${actionData.ebookId}`);
                } else {
                    // 편집 모드에서는 이전 페이지로 이동
                    console.log(`[ActionDataHandler] 이전 페이지로 이동`);
                    navigate(-1);
                }
            }
        } else if (actionData.error) {
            console.log(`[ActionDataHandler] 오류 처리: ${actionData.error}`);
            toast("저장 실패", {
                description: actionData.error,
            });
        }
    }, [actionData, setError, navigate, isEditMode, setCurrentStep]);

    return null;
}

// 새 전자책 모드 컴포넌트
function NewEbookForm({
    methods,
    currentStep,
    setCurrentStep,
    actionData,
    handleCoverImageChange,
    handlePagesChange
}: {
    methods: any;
    currentStep: FormStep;
    setCurrentStep: (step: FormStep) => void;
    actionData: any;
    handleCoverImageChange: (file: File) => void;
    handlePagesChange: (pages: PageItem[]) => void;
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { trigger, getValues, formState } = methods;

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
        <>
            <EbookFormStepper
                currentStep={currentStep}
                completedSteps={[]}
                onStepChange={setCurrentStep}
            />

            <Form
                ref={formRef}
                method="post"
                encType="multipart/form-data"
                className="space-y-8 mt-6"
            >
                {/* 기본 정보 스텝 */}
                {currentStep === FormStep.BASIC_INFO && (
                    <BasicInfoStep
                        onCoverImageChange={handleCoverImageChange}
                    />
                )}

                {/* 메타데이터 스텝 */}
                {currentStep === FormStep.METADATA && (
                    <MetadataStep />
                )}

                {/* 페이지 스텝 */}
                {currentStep === FormStep.PAGES && (
                    <PagesStep
                        onPagesChange={handlePagesChange}
                    />
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
        </>
    );
}

// 편집 모드 컴포넌트
function EditEbookForm({
    methods,
    handleCoverImageChange,
    handlePagesChange
}: {
    methods: any;
    handleCoverImageChange: (file: File) => void;
    handlePagesChange: (pages: PageItem[]) => void;
}) {
    const [activeTab, setActiveTab] = useState('basic');
    const [isSaving, setIsSaving] = useState(false);
    const { watch, formState, getValues } = methods;
    const formRef = useRef<HTMLFormElement>(null);
    const navigate = useNavigate();

    // 디버깅을 위한 폼 상태 로깅
    useEffect(() => {
        console.log("[EditEbookForm] 폼 상태:", {
            isValid: formState.isValid,
            isDirty: formState.isDirty,
            errors: formState.errors,
            title: watch("title"),
            status: watch("status"),
            pages: watch("pages")?.length || 0
        });
    }, [formState, watch]);

    // 폼 제출 핸들러
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 기본 제출 동작 방지

        console.log("[EditEbookForm] 폼 제출 시작");
        console.log("[EditEbookForm] 폼 유효성:", formState.isValid);
        console.log("[EditEbookForm] 폼 에러:", formState.errors);
        console.log("[EditEbookForm] 폼 데이터:", {
            title: getValues("title"),
            description: getValues("description"),
            status: getValues("status"),
            price: getValues("price"),
            pages: getValues("pages")?.length || 0
        });

        // 폼 유효성 검사
        if (formState.isValid) {
            console.log("[EditEbookForm] 폼 유효성 검사 통과");
            setIsSaving(true);

            // 폼 제출
            if (formRef.current) {
                console.log("[EditEbookForm] 폼 제출 실행");

                try {
                    formRef.current.submit();
                    console.log("[EditEbookForm] 폼 제출 완료");

                    // 저장 후 일정 시간 후 이전 페이지로 이동 (폴백 처리)
                    setTimeout(() => {
                        if (isSaving) {
                            console.log("[EditEbookForm] 타임아웃 후 이전 페이지로 이동");
                            toast("저장 완료", {
                                description: "전자책 정보가 저장되었습니다. 이전 페이지로 이동합니다.",
                            });
                            navigate(-1);
                        }
                    }, 3000);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
                    console.error("[EditEbookForm] 폼 제출 오류:", errorMessage);
                    setIsSaving(false);
                    toast("저장 실패", {
                        description: "폼 제출 중 오류가 발생했습니다.",
                    });
                }
            } else {
                console.error("[EditEbookForm] 폼 참조 없음");
                setIsSaving(false);
            }
        } else {
            // 유효성 검사 실패 시 오류 메시지 표시
            console.log("[EditEbookForm] 폼 유효성 검사 실패");

            // 구체적인 오류 필드 로깅
            Object.entries(formState.errors).forEach(([field, error]) => {
                console.log(`[EditEbookForm] 필드 오류: ${field} - ${error.message}`);
            });

            toast("저장 실패", {
                description: "입력 정보를 확인해주세요.",
            });
        }
    };

    return (
        <Form ref={formRef} method="post" onSubmit={handleSubmit}>
            {/* 모든 필드를 hidden input으로 포함 */}
            <input type="hidden" name="title" value={watch("title") || ""} />
            <input type="hidden" name="description" value={watch("description") || ""} />
            <input type="hidden" name="price" value={watch("price") || 0} />
            <input type="hidden" name="status" value={watch("status") || "draft"} />
            <input type="hidden" name="isFeatured" value={watch("isFeatured") ? "true" : "false"} />
            <input type="hidden" name="coverImageUrl" value={watch("coverImageUrl") || ""} />
            <input type="hidden" name="readingTime" value={watch("readingTime") || 0} />
            <input type="hidden" name="language" value={watch("language") || "ko"} />
            <input type="hidden" name="isbn" value={watch("isbn") || ""} />
            <input type="hidden" name="publicationDate" value={watch("publicationDate") || ""} />
            <input type="hidden" name="pages" value={JSON.stringify(watch("pages") || [])} />
            <input type="hidden" name="sampleContent" value={watch("sampleContent") || ""} />

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="mb-6">
                    <TabsTrigger value="basic">기본 정보</TabsTrigger>
                    <TabsTrigger value="pages">페이지</TabsTrigger>
                    <TabsTrigger value="sample">샘플</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                    <BasicInfoStep
                        isEditMode={true}
                        onCoverImageChange={handleCoverImageChange}
                    />
                </TabsContent>

                <TabsContent value="pages">
                    <PagesStep
                        isEditMode={true}
                        onPagesChange={handlePagesChange}
                    />
                </TabsContent>

                <TabsContent value="sample">
                    <SampleContentStep
                        isEditMode={true}
                    />
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "저장 중..." : "저장"}
                    {!isSaving && <Save className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </Form>
    );
}

export function EbookForm({ mode, initialData, actionData, onSubmit, title }: EbookFormProps) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);

    // 디버깅 로그
    console.log("[EbookForm] 초기화:", { mode, title });
    console.log("[EbookForm] 초기 데이터:", initialData);
    console.log("[EbookForm] 액션 데이터:", actionData);

    // 모드에 따라 다른 UI 표시
    const isEditMode = mode === 'edit';

    // 초기 데이터 포맷팅
    const formattedInitialData = formatInitialData(initialData);

    // React Hook Form 설정
    const methods = useForm<EbookFormValues>({
        resolver: zodResolver(ebookFormSchema),
        defaultValues: actionData?.defaultValues || formattedInitialData || {
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

    const { setValue, setError, watch } = methods;

    // 디버깅 로그 - 폼 값 변경 감지
    useEffect(() => {
        console.log("[EbookForm] 폼 값 변경:", {
            title: watch("title"),
            status: watch("status"),
            pages: watch("pages")?.length || 0
        });
    }, [watch("title"), watch("status"), watch("pages")]);

    // 커버 이미지 변경 핸들러
    const handleCoverImageChange = (file: File) => {
        console.log("[EbookForm] 커버 이미지 변경:", file.name);
        // 실제 구현에서는 이미지를 업로드하고 URL을 받아와야 합니다.
        const fakeUrl = URL.createObjectURL(file);
        setValue("coverImageUrl", fakeUrl);
    };

    // 페이지 변경 핸들러
    const handlePagesChange = (updatedPages: PageItem[]) => {
        console.log("[EbookForm] 페이지 변경:", updatedPages.length);
        setValue("pages", updatedPages);
    };

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
                <h1 className="text-2xl font-bold">
                    {title || (isEditMode ? `${methods.watch("title") || "전자책"} 편집` : "새 전자책 만들기")}
                </h1>
            </div>

            {/* 서버 오류 메시지 표시 */}
            {actionData?.fieldErrors?.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    <p>{actionData.fieldErrors.form}</p>
                </div>
            )}

            {/* 액션 데이터 처리 */}
            <ActionDataHandler
                actionData={actionData}
                isEditMode={isEditMode}
                setError={setError}
                setCurrentStep={setCurrentStep}
                navigate={navigate}
            />

            <FormProvider {...methods}>
                {/* 모드에 따라 다른 UI 표시 */}
                {isEditMode ? (
                    // 편집 모드 - 탭 방식
                    <EditEbookForm
                        methods={methods}
                        handleCoverImageChange={handleCoverImageChange}
                        handlePagesChange={handlePagesChange}
                    />
                ) : (
                    // 새 전자책 모드 - 스텝퍼 방식
                    <NewEbookForm
                        methods={methods}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        actionData={actionData}
                        handleCoverImageChange={handleCoverImageChange}
                        handlePagesChange={handlePagesChange}
                    />
                )}
            </FormProvider>
        </div>
    );
} 