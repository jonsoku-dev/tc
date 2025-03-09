import { redirect } from "react-router";
import { parseFormData, validateFormData } from "~/common/utils/form-utils";
import { getServerClient } from "~/server";
import { EbookForm } from "../components/ebook-form";
import type { EbookFormValues } from "../schemas/ebook-form.schema";
import { ebookFormSchema, FormStep } from "../schemas/ebook-form.schema";
import type { Route } from "./+types/ebook-new-page.page";
import { zodResolver } from "@hookform/resolvers/zod";

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
                if (field === 'title' || field === 'description' || field === 'status' || field === 'price' || field === 'isFeatured' || field === 'coverImageUrl') {
                    currentStep = FormStep.BASIC_INFO;
                    break;
                } else if (field === 'readingTime' || field === 'language' || field === 'isbn' || field === 'publicationDate') {
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

        return redirect(`/ebooks/${ebook.ebook_id}`);
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

export default function EbookNewPage({ actionData }: Route.ComponentProps) {
    return (
        <EbookForm
            mode="new"
            actionData={actionData}
            title="새 전자책 만들기"
        />
    );
} 