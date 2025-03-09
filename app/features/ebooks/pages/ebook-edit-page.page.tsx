import { createClient } from "~/supa-client";
import { EbookForm } from "../components/ebook-form";
import { EBOOK_STATUS } from "../constants";
import type { Route } from "./+types/ebook-edit-page.page";
import { format } from "date-fns";
import { redirect } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
    const ebookId = params.ebookId;

    if (!ebookId) {
        throw new Response("전자책 ID가 필요합니다.", { status: 400 });
    }

    // Supabase 클라이언트 생성
    const supabase = createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    });

    try {
        // 전자책 정보 가져오기
        const { data: ebook, error: ebookError } = await supabase
            .from('ebooks')
            .select('*')
            .eq('ebook_id', ebookId)
            .single();

        if (ebookError) {
            console.error("전자책 정보 조회 오류:", ebookError);
            throw new Response("전자책 정보를 가져오는 중 오류가 발생했습니다.", { status: 500 });
        }

        if (!ebook) {
            throw new Response("전자책을 찾을 수 없습니다.", { status: 404 });
        }

        // 전자책 페이지 가져오기
        const { data: pages, error: pagesError } = await supabase
            .from('ebook_pages')
            .select('*')
            .eq('ebook_id', ebookId)
            .order('position', { ascending: true });

        if (pagesError) {
            console.error("전자책 페이지 조회 오류:", pagesError);
            throw new Response("전자책 페이지를 가져오는 중 오류가 발생했습니다.", { status: 500 });
        }

        // 날짜 형식 변환
        if (ebook.publication_date) {
            try {
                ebook.publication_date = format(new Date(ebook.publication_date), "yyyy-MM-dd");
            } catch (error) {
                console.error("날짜 변환 오류:", error);
            }
        }

        return {
            ebook: {
                ...ebook,
                pages: pages || [],
            },
        };
    } catch (error) {
        console.error("전자책 데이터 로딩 오류:", error);
        if (error instanceof Response) {
            throw error;
        }
        throw new Response("전자책 데이터를 가져오는 중 오류가 발생했습니다.", { status: 500 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    console.log("[action] 시작: 파라미터", params);

    const ebookId = params.ebookId;

    if (!ebookId) {
        console.log("[action] 오류: 전자책 ID 없음");
        return new Response(
            JSON.stringify({ success: false, error: "전자책 ID가 필요합니다." }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 400,
            }
        );
    }

    // Supabase 클라이언트 생성
    const supabase = createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    });

    try {
        console.log("[action] 폼 데이터 파싱 시작");
        const formData = await request.formData();

        // 폼 데이터 로깅
        const formDataObj: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
            formDataObj[key] = value;
        }
        console.log("[action] 폼 데이터:", {
            ...formDataObj,
            pages: formData.get("pages") ? JSON.parse(formData.get("pages") as string).length : 0
        });

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const status = formData.get("status") as string;
        const price = formData.get("price") as string;
        const publicationDate = formData.get("publicationDate") as string;
        const readingTime = formData.get("readingTime") as string;
        const language = formData.get("language") as string;
        const isFeatured = formData.get("isFeatured") === "true";
        const isbn = formData.get("isbn") as string;
        const coverImageUrl = formData.get("coverImageUrl") as string;
        const sampleContent = formData.get("sampleContent") as string;
        const pages = JSON.parse(formData.get("pages") as string || "[]");

        // status 값이 유효한지 확인
        if (!EBOOK_STATUS.includes(status as typeof EBOOK_STATUS[number])) {
            console.log("[action] 오류: 유효하지 않은 상태 값", status);
            return new Response(
                JSON.stringify({ success: false, error: "유효하지 않은 상태 값입니다." }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 400,
                }
            );
        }

        console.log("[action] 전자책 정보 업데이트 시작");
        // 전자책 정보 업데이트
        const { error: updateError } = await supabase
            .from('ebooks')
            .update({
                title,
                description,
                ebook_status: status as "draft" | "published" | "archived",
                price: price ? parseFloat(price) : null,
                publication_date: publicationDate || null,
                reading_time: readingTime ? parseInt(readingTime, 10) : null,
                language,
                is_featured: isFeatured,
                isbn,
                cover_image_url: coverImageUrl,
                sample_content: sampleContent,
                page_count: pages.length
            })
            .eq('ebook_id', ebookId);

        if (updateError) {
            console.error("[action] 전자책 업데이트 오류:", updateError);
            return new Response(
                JSON.stringify({ success: false, error: "전자책 정보를 업데이트하는 중 오류가 발생했습니다." }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 500,
                }
            );
        }

        console.log("[action] 기존 페이지 조회 시작");
        // 기존 페이지 가져오기
        const { data: existingPages, error: pagesError } = await supabase
            .from('ebook_pages')
            .select('*')
            .eq('ebook_id', ebookId);

        if (pagesError) {
            console.error("[action] 전자책 페이지 조회 오류:", pagesError);
            return new Response(
                JSON.stringify({ success: false, error: "전자책 페이지를 조회하는 중 오류가 발생했습니다." }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 500,
                }
            );
        }

        console.log("[action] 페이지 업데이트 로직 시작");
        console.log("[action] 기존 페이지 수:", existingPages?.length || 0);
        console.log("[action] 새 페이지 수:", pages.length);

        // 페이지 업데이트 로직
        // 1. 기존 페이지 ID를 맵으로 저장
        const existingPageMap = new Map();
        existingPages?.forEach(page => {
            existingPageMap.set(page.page_id, page);
        });

        // 2. 새 페이지 데이터 준비
        const pagesToUpdate: Array<{
            page_id: string;
            title: string;
            blocks: any[];
            position: number;
            page_number: number;
        }> = [];

        const pagesToCreate: Array<{
            ebook_id: string;
            title: string;
            blocks: any[];
            position: number;
            page_number: number;
        }> = [];

        const pageIdsToKeep = new Set<string>();

        pages.forEach((page: any) => {
            // 기존 페이지 ID가 있는 경우 업데이트
            if (page.id && page.id.startsWith('page-id-')) {
                const pageId = page.id.replace('page-id-', '');
                pageIdsToKeep.add(pageId);

                pagesToUpdate.push({
                    page_id: pageId,
                    title: page.title,
                    blocks: page.blocks,
                    position: page.position,
                    page_number: page.position // 페이지 번호와 위치를 동일하게 설정
                });
            } else {
                // 새 페이지 생성
                pagesToCreate.push({
                    ebook_id: ebookId,
                    title: page.title,
                    blocks: page.blocks,
                    position: page.position,
                    page_number: page.position // 페이지 번호와 위치를 동일하게 설정
                });
            }
        });

        // 3. 삭제할 페이지 ID 목록 생성
        const pageIdsToDelete: string[] = [];
        existingPages?.forEach(page => {
            if (!pageIdsToKeep.has(page.page_id)) {
                pageIdsToDelete.push(page.page_id);
            }
        });

        console.log("[action] 페이지 처리 요약:", {
            업데이트: pagesToUpdate.length,
            생성: pagesToCreate.length,
            삭제: pageIdsToDelete.length
        });

        // 4. 트랜잭션 처리
        // 4.1. 삭제할 페이지 처리
        if (pageIdsToDelete.length > 0) {
            console.log("[action] 페이지 삭제 시작:", pageIdsToDelete);
            const { error: deleteError } = await supabase
                .from('ebook_pages')
                .delete()
                .in('page_id', pageIdsToDelete);

            if (deleteError) {
                console.error("[action] 페이지 삭제 오류:", deleteError);
                return new Response(
                    JSON.stringify({ success: false, error: "페이지를 삭제하는 중 오류가 발생했습니다." }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        status: 500,
                    }
                );
            }
        }

        // 4.2. 업데이트할 페이지 처리
        console.log("[action] 페이지 업데이트 시작");
        for (const page of pagesToUpdate) {
            console.log(`[action] 페이지 업데이트: ${page.page_id}`);
            const { error: updatePageError } = await supabase
                .from('ebook_pages')
                .update({
                    title: page.title,
                    blocks: page.blocks,
                    position: page.position,
                    page_number: page.page_number
                })
                .eq('page_id', page.page_id);

            if (updatePageError) {
                console.error("[action] 페이지 업데이트 오류:", updatePageError);
                return new Response(
                    JSON.stringify({ success: false, error: "페이지를 업데이트하는 중 오류가 발생했습니다." }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        status: 500,
                    }
                );
            }
        }

        // 4.3. 새 페이지 생성
        if (pagesToCreate.length > 0) {
            console.log("[action] 새 페이지 생성 시작:", pagesToCreate.length);
            const { error: createError } = await supabase
                .from('ebook_pages')
                .insert(pagesToCreate);

            if (createError) {
                console.error("[action] 페이지 생성 오류:", createError);
                return new Response(
                    JSON.stringify({ success: false, error: "페이지를 생성하는 중 오류가 발생했습니다." }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        status: 500,
                    }
                );
            }
        }

        console.log("[action] 성공 응답 반환");
        return redirect(`/ebooks/${ebookId}`);
    } catch (error) {
        console.error("[action] 전자책 업데이트 오류:", error);
        return new Response(
            JSON.stringify({ success: false, error: "전자책 정보를 업데이트하는 중 오류가 발생했습니다." }),
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
        { title: `${data.ebook.title} 편집` },
        { name: "description", content: "전자책 정보와 콘텐츠를 편집하세요" },
    ];
}

export default function EbookEditPage({ loaderData, actionData }: Route.ComponentProps) {
    // 디버깅 로그
    console.log("[EbookEditPage] 로더 데이터:", {
        ebookId: loaderData?.ebook?.ebook_id,
        title: loaderData?.ebook?.title,
        pagesCount: loaderData?.ebook?.pages?.length || 0
    });
    console.log("[EbookEditPage] 액션 데이터:", actionData);

    // 액션 데이터가 Response 객체인 경우 처리
    let processedActionData: any = actionData;

    if (actionData && typeof actionData === 'object' && 'status' in actionData) {
        try {
            console.log("[EbookEditPage] Response 객체 처리:", {
                status: (actionData as any).status,
                statusText: (actionData as any).statusText,
                headers: (actionData as any).headers
            });

            // Response 객체에서 데이터 추출
            if ((actionData as any).status >= 200 && (actionData as any).status < 300) {
                processedActionData = { success: true, ebookId: loaderData.ebook.ebook_id };
                console.log("[EbookEditPage] 성공 응답 생성:", processedActionData);
            } else {
                processedActionData = { success: false, error: "저장 중 오류가 발생했습니다." };
                console.log("[EbookEditPage] 오류 응답 생성:", processedActionData);
            }
        } catch (error) {
            console.error("[EbookEditPage] 액션 데이터 처리 오류:", error);
            processedActionData = { success: false, error: "데이터 처리 중 오류가 발생했습니다." };
        }
    }

    return (
        <EbookForm
            mode="edit"
            initialData={loaderData}
            actionData={processedActionData}
            title={`${loaderData.ebook.title} 편집`}
        />
    );
} 