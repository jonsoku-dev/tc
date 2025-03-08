import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Input } from "~/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/common/components/ui/select";
import type { EbookFormValues } from "../../schemas/ebook-form.schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/common/components/ui/form";

export function MetadataStep() {
    const { control } = useFormContext<EbookFormValues>();

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
                    <FormField
                        control={control}
                        name="readingTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>읽기 시간 (분)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="예상 읽기 시간을 분 단위로 입력하세요"
                                        min="1"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>언어</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="언어 선택" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ko">한국어</SelectItem>
                                        <SelectItem value="en">영어</SelectItem>
                                        <SelectItem value="ja">일본어</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="publicationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>출판일</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="date"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="isbn"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>ISBN</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="ISBN을 입력하세요 (선택사항)"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
} 