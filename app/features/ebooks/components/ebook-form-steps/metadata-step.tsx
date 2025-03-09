import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { FormInputPair, FormSelectPair } from "../form-items";
import type { EbookFormValues } from "../../schemas/ebook-form.schema";

interface MetadataStepProps {
    isEditMode?: boolean;
}

export function MetadataStep({ isEditMode = false }: MetadataStepProps) {
    const { control } = useFormContext<EbookFormValues>();

    // 언어 옵션 생성
    const languageOptions = [
        { label: "한국어", value: "ko" },
        { label: "영어", value: "en" },
        { label: "일본어", value: "ja" }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">메타데이터</CardTitle>
                <CardDescription>
                    전자책의 상세 정보를 입력하세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInputPair
                        name="readingTime"
                        label="읽기 시간 (분)"
                        placeholder="예상 읽기 시간을 분 단위로 입력하세요"
                        type="number"
                        min={1}
                    />

                    <FormSelectPair
                        name="language"
                        label="언어"
                        placeholder="언어 선택"
                        options={languageOptions}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInputPair
                        name="isbn"
                        label="ISBN"
                        placeholder="ISBN을 입력하세요"
                    />

                    <FormInputPair
                        name="publicationDate"
                        label="출판일"
                        placeholder="출판일을 선택하세요"
                        type="date"
                    />
                </div>
            </CardContent>
        </Card>
    );
} 