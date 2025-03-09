import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/common/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EBOOK_STATUS } from "../../constants";
import { EbookCover } from "../ebook-cover";
import type { EbookFormValues } from "../../schemas/ebook-form.schema";
import { FormInputPair, FormSelectPair, FormCheckboxPair } from "../form-items";
import { useEffect } from "react";

interface BasicInfoStepProps {
    isEditMode?: boolean;
    onCoverImageChange?: (file: File) => void;
}

export function BasicInfoStep({
    isEditMode = false,
    onCoverImageChange
}: BasicInfoStepProps) {
    // React Hook Form 사용
    const { watch, setValue, formState: { errors } } = useFormContext<EbookFormValues>();
    const title = watch("title");
    const coverImageUrl = watch("coverImageUrl");

    // 커버 이미지 변경 핸들러
    const handleCoverImageChange = (file: File) => {
        if (onCoverImageChange) {
            onCoverImageChange(file);
        } else {
            // 실제 구현에서는 이미지를 업로드하고 URL을 받아와야 합니다.
            const fakeUrl = URL.createObjectURL(file);
            setValue("coverImageUrl", fakeUrl);
        }
    };

    // 필수 필드 에러 확인
    const hasRequiredFieldErrors = !!errors.title;

    // 상태 옵션 생성
    const statusOptions = EBOOK_STATUS.map(status => ({
        label: status === "draft" ? "초안" : status === "published" ? "출판됨" : "보관됨",
        value: status
    }));

    // 언어 옵션 생성
    const languageOptions = [
        { label: "한국어", value: "ko" },
        { label: "영어", value: "en" },
        { label: "일본어", value: "ja" }
    ];

    // 디버깅 로그
    useEffect(() => {
        if (isEditMode) {
            console.log("BasicInfoStep - Edit Mode Data:", {
                title,
                coverImageUrl,
                status: watch("status"),
                price: watch("price"),
                language: watch("language"),
                isFeatured: watch("isFeatured")
            });
        }
    }, [isEditMode, title, coverImageUrl, watch]);

    if (isEditMode) {
        // 편집 모드 UI
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>기본 정보</CardTitle>
                            <CardDescription>
                                전자책의 기본 정보를 입력하세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormInputPair
                                name="title"
                                label="제목"
                                placeholder="전자책 제목을 입력하세요"
                                required
                            />

                            <FormInputPair
                                name="description"
                                label="설명"
                                placeholder="전자책에 대한 간단한 설명을 입력하세요"
                                textArea
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormSelectPair
                                    name="status"
                                    label="상태"
                                    placeholder="상태 선택"
                                    options={statusOptions}
                                />

                                <FormInputPair
                                    name="price"
                                    label="가격"
                                    placeholder="가격을 입력하세요"
                                    type="number"
                                    min={0}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormInputPair
                                    name="publicationDate"
                                    label="출판일"
                                    placeholder="출판일을 선택하세요"
                                    type="date"
                                />

                                <FormInputPair
                                    name="readingTime"
                                    label="읽기 시간 (분)"
                                    placeholder="예상 읽기 시간을 입력하세요"
                                    type="number"
                                    min={0}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormSelectPair
                                    name="language"
                                    label="언어"
                                    placeholder="언어 선택"
                                    options={languageOptions}
                                />

                                <FormInputPair
                                    name="isbn"
                                    label="ISBN"
                                    placeholder="ISBN을 입력하세요"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>표지 이미지</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EbookCover
                                imageUrl={coverImageUrl}
                                alt={title}
                                onImageChange={handleCoverImageChange}
                                editable
                            />
                        </CardContent>
                        <CardContent>
                            <FormCheckboxPair
                                name="isFeatured"
                                label="추천 도서로 표시"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // new 모드 UI
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">기본 정보</CardTitle>
                <CardDescription>
                    새 전자책의 기본 정보를 입력하세요.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {hasRequiredFieldErrors && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>오류</AlertTitle>
                        <AlertDescription>
                            필수 정보를 모두 입력해주세요.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <FormInputPair
                            name="title"
                            label="제목"
                            placeholder="전자책 제목을 입력하세요"
                            required
                        />

                        <FormInputPair
                            name="description"
                            label="설명"
                            placeholder="전자책에 대한 간단한 설명을 입력하세요"
                            textArea
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInputPair
                                name="price"
                                label="가격 (원)"
                                placeholder="가격을 입력하세요"
                                type="number"
                                min={0}
                            />

                            <FormSelectPair
                                name="status"
                                label="상태"
                                placeholder="상태 선택"
                                options={statusOptions}
                            />
                        </div>

                        <FormCheckboxPair
                            name="isFeatured"
                            label="추천 eBook으로 표시"
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-2">표지 이미지</h3>
                        <EbookCover
                            imageUrl={coverImageUrl || undefined}
                            alt={title || "새 eBook"}
                            editable={true}
                            onImageChange={handleCoverImageChange}
                            className="w-full aspect-[2/3]"
                        />
                        {errors?.coverImageUrl && (
                            <p className="text-sm text-red-500 mt-1">{errors.coverImageUrl.message}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 