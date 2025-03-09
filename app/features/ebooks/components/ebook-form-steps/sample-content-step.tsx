import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { MarkdownEditor } from "../markdown-editor";
import type { EbookFormValues } from "../../schemas/ebook-form.schema";
import { useEffect } from "react";

interface SampleContentStepProps {
    isEditMode?: boolean;
}

export function SampleContentStep({ isEditMode = false }: SampleContentStepProps) {
    // React Hook Form 사용
    const { setValue, watch } = useFormContext<EbookFormValues>();
    const sampleContent = watch("sampleContent") || "";

    // 샘플 콘텐츠 변경 핸들러
    const handleSampleContentChange = (content: string) => {
        setValue("sampleContent", content);
    };

    // 디버깅 로그
    useEffect(() => {
        if (isEditMode) {
            console.log("SampleContentStep - Edit Mode Content:", sampleContent ? `${sampleContent.substring(0, 50)}...` : "없음");
        }
    }, [isEditMode, sampleContent]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">샘플 콘텐츠</CardTitle>
                <CardDescription>
                    전자책의 샘플 콘텐츠를 작성하세요. 이 내용은 구매 전 미리보기로 제공됩니다.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MarkdownEditor
                    value={sampleContent}
                    onChange={handleSampleContentChange}
                    minHeight={400}
                />
            </CardContent>
        </Card>
    );
} 