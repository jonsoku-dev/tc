import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { MarkdownEditor } from "../markdown-editor";
import type { EbookFormValues } from "../../schemas/ebook-form.schema";

export function SampleContentStep() {
    const { setValue, watch } = useFormContext<EbookFormValues>();
    const sampleContent = watch("sampleContent");

    const handleContentChange = (value: string) => {
        setValue("sampleContent", value, { shouldValidate: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">샘플 콘텐츠 작성</CardTitle>
                <CardDescription>
                    무료로 제공할 샘플 콘텐츠를 작성하세요.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MarkdownEditor
                    value={sampleContent || ""}
                    onChange={handleContentChange}
                    placeholder="마크다운 형식으로 샘플 콘텐츠를 작성하세요"
                    minHeight={300}
                />
            </CardContent>
        </Card>
    );
} 