import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Textarea } from "~/common/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import { EBOOK_STATUS } from "../../constants";
import { EbookCover } from "../ebook-cover";
import type { EbookFormValues } from "../../schemas/ebook-form.schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/common/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "~/common/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function BasicInfoStep() {
    const { control, watch, setValue, formState: { errors, touchedFields } } = useFormContext<EbookFormValues>();
    const title = watch("title");

    const handleCoverImageChange = (file: File) => {
        // 실제 구현에서는 이미지를 업로드하고 URL을 받아와야 합니다.
        // 여기서는 임시로 File 객체의 이름을 저장합니다.
        const fakeUrl = URL.createObjectURL(file);
        setValue("coverImageUrl", fakeUrl);
    };

    // 필수 필드 에러 확인
    const hasRequiredFieldErrors = !!errors.title;

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
                        <FormField
                            control={control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">제목</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="전자책 제목을 입력하세요"
                                            className={errors.title ? "border-red-500" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>설명</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="전자책에 대한 간단한 설명을 입력하세요"
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>가격 (원)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="가격을 입력하세요"
                                                min="0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>상태</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="상태 선택" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EBOOK_STATUS.map((statusOption) => (
                                                    <SelectItem key={statusOption} value={statusOption}>
                                                        {statusOption === "published" ? "출판됨" :
                                                            statusOption === "draft" ? "초안" : "보관됨"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={control}
                            name="isFeatured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="rounded"
                                        />
                                    </FormControl>
                                    <FormLabel>추천 eBook으로 표시</FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <Label className="block mb-2">표지 이미지</Label>
                        <EbookCover
                            imageUrl={watch("coverImageUrl") || undefined}
                            alt={title || "새 eBook"}
                            editable={true}
                            onImageChange={handleCoverImageChange}
                            className="w-full aspect-[2/3]"
                        />
                        {errors.coverImageUrl && (
                            <p className="text-sm text-red-500 mt-1">{errors.coverImageUrl.message}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 