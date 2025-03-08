import { z } from "zod";
import { EBOOK_STATUS } from "../constants";
import type { Block } from "../components/types";

// 페이지 아이템 스키마
export const pageItemSchema = z.object({
    position: z.coerce.number(),
    title: z.string().min(1, "페이지 제목을 입력해주세요"),
    blocks: z.array(z.any() as z.ZodType<Block>),
    id: z.string(),
});

export type PageItem = z.infer<typeof pageItemSchema>;

// 기본 정보 스키마
export const basicInfoSchema = z.object({
    title: z.preprocess(
        (val) => String(val),
        z.string()
            .min(1, "제목을 입력해주세요")
            .max(100, "제목은 100자 이내로 입력해주세요")
    ),
    description: z.preprocess(
        (val) => val === null || val === undefined ? "" : String(val),
        z.string()
            .max(1000, "설명은 1000자 이내로 입력해주세요")
            .optional()
            .or(z.literal(""))
    ),
    price: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.coerce.number()
            .min(0, "가격은 0 이상이어야 합니다")
            .optional()
    ),
    status: z.enum(["draft", "published", "archived"], {
        errorMap: () => ({ message: "유효한 상태를 선택해주세요" })
    }),
    isFeatured: z.preprocess(
        (val) => val === "on" ? true : val === "off" ? false : val,
        z.coerce.boolean().default(false)
    ),
    coverImageUrl: z.string().optional().or(z.literal("")),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

// 메타데이터 스키마
export const metadataSchema = z.object({
    readingTime: z.preprocess(
        (val) => val === "" ? undefined : val,
        z.coerce.number()
            .positive("읽기 시간은 0보다 커야 합니다")
            .optional()
    ),
    language: z.string().default("ko"),
    isbn: z.preprocess(
        (val) => val === null || val === undefined ? "" : String(val),
        z.string()
            .regex(/^(?:\d{10}|\d{13})$/, "ISBN은 10자리 또는 13자리 숫자여야 합니다")
            .optional()
            .or(z.literal(""))
    ),
    publicationDate: z.preprocess(
        (val) => val === null || val === undefined ? "" : String(val),
        z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD여야 합니다")
            .optional()
            .or(z.literal(""))
    ),
});

export type MetadataFormValues = z.infer<typeof metadataSchema>;

// 페이지 스키마
export const pagesSchema = z.object({
    pages: z.array(pageItemSchema)
        .min(1, "최소 한 개 이상의 페이지를 추가해주세요"),
});

export type PagesFormValues = z.infer<typeof pagesSchema>;

// 샘플 콘텐츠 스키마
export const sampleContentSchema = z.object({
    sampleContent: z.preprocess(
        (val) => val === null || val === undefined ? "" : String(val),
        z.string()
            .max(5000, "샘플 콘텐츠는 5000자 이내로 입력해주세요")
            .optional()
            .or(z.literal(""))
    ),
});

export type SampleContentFormValues = z.infer<typeof sampleContentSchema>;

// 전체 폼 스키마
export const ebookFormSchema = basicInfoSchema
    .merge(metadataSchema)
    .merge(pagesSchema)
    .merge(sampleContentSchema);

export type EbookFormValues = z.infer<typeof ebookFormSchema>;

// 스텝 타입
export enum FormStep {
    BASIC_INFO = "basic",
    METADATA = "metadata",
    PAGES = "pages",
    SAMPLE_CONTENT = "sample",
}

// 스텝별 스키마 매핑
export const stepSchemas = {
    [FormStep.BASIC_INFO]: basicInfoSchema,
    [FormStep.METADATA]: metadataSchema,
    [FormStep.PAGES]: pagesSchema,
    [FormStep.SAMPLE_CONTENT]: sampleContentSchema,
};

// 스텝 순서
export const FORM_STEPS = [
    FormStep.BASIC_INFO,
    FormStep.METADATA,
    FormStep.PAGES,
    FormStep.SAMPLE_CONTENT,
];

// 스텝 이름 매핑
export const STEP_NAMES = {
    [FormStep.BASIC_INFO]: "기본 정보",
    [FormStep.METADATA]: "메타데이터",
    [FormStep.PAGES]: "페이지",
    [FormStep.SAMPLE_CONTENT]: "샘플 콘텐츠",
};
