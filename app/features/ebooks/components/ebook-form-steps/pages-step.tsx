import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { PageEditor } from "../page-editor/index";
import type { EbookFormValues } from "../../schemas/ebook-form.schema";
import type { PageItem } from "../../schemas/ebook-form.schema";
import { Alert, AlertDescription, AlertTitle } from "~/common/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function PagesStep() {
    const { setValue, watch, formState: { errors } } = useFormContext<EbookFormValues>();
    const pages = watch("pages");

    const handlePagesChange = (updatedPages: PageItem[]) => {
        setValue("pages", updatedPages, { shouldValidate: true });
        // 페이지 수 업데이트
        setValue("pageCount", String(updatedPages.length), { shouldValidate: true });
    };

    // 페이지가 없는지 확인
    const hasNoPages = !pages || pages.length === 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">페이지 관리</CardTitle>
                <CardDescription>
                    전자책의 페이지를 추가하고 관리하세요.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasNoPages && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>오류</AlertTitle>
                        <AlertDescription>
                            최소 한 개 이상의 페이지를 추가해주세요.
                        </AlertDescription>
                    </Alert>
                )}

                <PageEditor
                    pages={pages}
                    editable={true}
                    onPagesChange={handlePagesChange}
                />
            </CardContent>
        </Card>
    );
} 