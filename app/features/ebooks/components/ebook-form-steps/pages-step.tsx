import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { PageEditor } from "../page-editor";
import type { PageItem } from "../../machines/ebook-form.machine";
import { useEffect } from "react";

interface PagesStepProps {
    isEditMode?: boolean;
    onPagesChange?: (pages: PageItem[]) => void;
}

export function PagesStep({ isEditMode = false, onPagesChange }: PagesStepProps) {
    // React Hook Form 사용
    const { setValue, watch } = useFormContext();
    const pages = watch("pages") || [];

    // 페이지 변경 핸들러
    const handlePagesChange = (updatedPages: PageItem[]) => {
        if (onPagesChange) {
            onPagesChange(updatedPages);
        } else {
            setValue("pages", updatedPages);
        }
    };

    // 디버깅 로그
    useEffect(() => {
        if (isEditMode) {
            console.log("PagesStep - Edit Mode Pages:", pages);
        }
    }, [isEditMode, pages]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">페이지 관리</CardTitle>
                <CardDescription>
                    전자책의 페이지를 관리하세요. 페이지를 추가, 삭제, 순서 변경할 수 있습니다.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PageEditor
                    pages={pages}
                    editable={true}
                    onPagesChange={handlePagesChange}
                />
            </CardContent>
        </Card>
    );
} 