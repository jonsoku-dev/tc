import { setup, assign } from "xstate";
import { EBOOK_STATUS } from "../constants";
import type { Block } from "../components/types";

export interface PageItem {
    position: number;
    title: string;
    blocks: Block[];
    id: string;
}

export interface EbookFormContext {
    // 기본 정보
    title: string;
    description: string;
    price: string;
    status: string;
    isFeatured: boolean;

    // 커버 이미지
    coverImageFile: File | null;
    coverImagePreview: string | null;
    coverImageUrl: string;

    // 메타데이터
    pageCount: string;
    readingTime: string;
    language: string;
    isbn: string;
    publicationDate: string;

    // 페이지 및 샘플 콘텐츠
    pages: PageItem[];
    sampleContent: string;

    // 폼 상태
    activeTab: string;
    formError: string | null;
    isSubmitting: boolean;
    isSuccess: boolean;
    ebookId: string;
    isSaving: boolean;
    isEdit: boolean;
}

export interface EbookFormInput {
    isEdit?: boolean;
    initialData?: Partial<EbookFormContext>;
}

// 이벤트 타입 정의
export type EbookFormEvent =
    | { type: "SET_TITLE"; value: string }
    | { type: "SET_DESCRIPTION"; value: string }
    | { type: "SET_PRICE"; value: string }
    | { type: "SET_STATUS"; value: string }
    | { type: "SET_IS_FEATURED"; value: boolean }
    | { type: "SET_COVER_IMAGE"; file: File }
    | { type: "SET_COVER_IMAGE_URL"; url: string }
    | { type: "SET_READING_TIME"; value: string }
    | { type: "SET_LANGUAGE"; value: string }
    | { type: "SET_ISBN"; value: string }
    | { type: "SET_PUBLICATION_DATE"; value: string }
    | { type: "SET_PAGES"; pages: PageItem[] }
    | { type: "SET_SAMPLE_CONTENT"; value: string }
    | { type: "CHANGE_TAB"; tab: string }
    | { type: "SET_FORM_ERROR"; error: string | null }
    | { type: "INIT_DATA"; data: Partial<EbookFormContext> }
    | { type: "SUBMIT" }
    | { type: "SUBMIT_SUCCESS"; ebookId: string }
    | { type: "RESET" };

// 전자책 폼 머신 생성 함수
export const createEbookFormMachine = setup({
    types: {
        context: {} as EbookFormContext,
        events: {} as EbookFormEvent,
        input: {} as EbookFormInput,
    },
    actions: {
        setTitle: assign(({ context, event }) => {
            if (event.type !== "SET_TITLE") return {};
            return { title: event.value };
        }),
        setDescription: assign(({ context, event }) => {
            if (event.type !== "SET_DESCRIPTION") return {};
            return { description: event.value };
        }),
        setPrice: assign(({ context, event }) => {
            if (event.type !== "SET_PRICE") return {};
            return { price: event.value };
        }),
        setStatus: assign(({ context, event }) => {
            if (event.type !== "SET_STATUS") return {};
            return { status: event.value };
        }),
        setIsFeatured: assign(({ context, event }) => {
            if (event.type !== "SET_IS_FEATURED") return {};
            return { isFeatured: event.value };
        }),
        setCoverImage: assign(({ context, event }) => {
            if (event.type !== "SET_COVER_IMAGE") return {};
            return {
                coverImageFile: event.file,
                coverImagePreview: event.file ? URL.createObjectURL(event.file) : null
            };
        }),
        setCoverImageUrl: assign(({ context, event }) => {
            if (event.type !== "SET_COVER_IMAGE_URL") return {};
            return { coverImageUrl: event.url };
        }),
        setReadingTime: assign(({ context, event }) => {
            if (event.type !== "SET_READING_TIME") return {};
            return { readingTime: event.value };
        }),
        setLanguage: assign(({ context, event }) => {
            if (event.type !== "SET_LANGUAGE") return {};
            return { language: event.value };
        }),
        setIsbn: assign(({ context, event }) => {
            if (event.type !== "SET_ISBN") return {};
            return { isbn: event.value };
        }),
        setPublicationDate: assign(({ context, event }) => {
            if (event.type !== "SET_PUBLICATION_DATE") return {};
            return { publicationDate: event.value };
        }),
        setPages: assign(({ context, event }) => {
            if (event.type !== "SET_PAGES") return {};
            return {
                pages: event.pages,
                pageCount: event.pages.length.toString()
            };
        }),
        setSampleContent: assign(({ context, event }) => {
            if (event.type !== "SET_SAMPLE_CONTENT") return {};
            return { sampleContent: event.value };
        }),
        changeTab: assign(({ context, event }) => {
            if (event.type !== "CHANGE_TAB") return {};
            return { activeTab: event.tab };
        }),
        setFormError: assign(({ context, event }) => {
            if (event.type !== "SET_FORM_ERROR") return {};
            return { formError: event.error };
        }),
        initData: assign(({ context, event }) => {
            if (event.type !== "INIT_DATA") return {};
            return { ...context, ...event.data };
        }),
        startSubmitting: assign({
            isSubmitting: true,
            isSaving: true
        }),
        setValidationError: assign({
            formError: "제목을 입력해주세요.",
            activeTab: "basic"
        }),
        submitSuccess: assign(({ context, event }) => {
            if (event.type !== "SUBMIT_SUCCESS") return {};
            return {
                isSubmitting: false,
                isSaving: false,
                isSuccess: true,
                ebookId: event.ebookId
            };
        }),
        submitError: assign(({ context, event }) => {
            if (event.type !== "SET_FORM_ERROR") return {};
            return {
                isSubmitting: false,
                isSaving: false,
                formError: event.error
            };
        }),
        resetForm: assign({
            title: "",
            description: "",
            price: "",
            status: "draft",
            isFeatured: false,
            coverImageFile: null,
            coverImagePreview: null,
            coverImageUrl: "",
            pageCount: "",
            readingTime: "",
            language: "ko",
            isbn: "",
            publicationDate: "",
            pages: [],
            sampleContent: "",
            activeTab: "basic",
            formError: null,
            isSubmitting: false,
            isSuccess: false,
            ebookId: "",
            isSaving: false
        })
    },
    guards: {
        isTitleValid: ({ context }) => context.title.trim() !== ""
    }
}).createMachine({
    id: "ebookForm",
    initial: "editing",
    context: ({ input }) => ({
        title: input?.initialData?.title || "",
        description: input?.initialData?.description || "",
        price: input?.initialData?.price || "",
        status: input?.initialData?.status || "draft",
        isFeatured: input?.initialData?.isFeatured || false,
        coverImageFile: input?.initialData?.coverImageFile || null,
        coverImagePreview: input?.initialData?.coverImagePreview || null,
        coverImageUrl: input?.initialData?.coverImageUrl || "",
        pageCount: input?.initialData?.pageCount || "",
        readingTime: input?.initialData?.readingTime || "",
        language: input?.initialData?.language || "ko",
        isbn: input?.initialData?.isbn || "",
        publicationDate: input?.initialData?.publicationDate || "",
        pages: input?.initialData?.pages || [],
        sampleContent: input?.initialData?.sampleContent || "",
        activeTab: input?.initialData?.activeTab || "basic",
        formError: input?.initialData?.formError || null,
        isSubmitting: input?.initialData?.isSubmitting || false,
        isSuccess: input?.initialData?.isSuccess || false,
        ebookId: input?.initialData?.ebookId || "",
        isSaving: input?.initialData?.isSaving || false,
        isEdit: input?.isEdit || false
    }),
    states: {
        editing: {
            on: {
                SET_TITLE: {
                    actions: "setTitle"
                },
                SET_DESCRIPTION: {
                    actions: "setDescription"
                },
                SET_PRICE: {
                    actions: "setPrice"
                },
                SET_STATUS: {
                    actions: "setStatus"
                },
                SET_IS_FEATURED: {
                    actions: "setIsFeatured"
                },
                SET_COVER_IMAGE: {
                    actions: "setCoverImage"
                },
                SET_COVER_IMAGE_URL: {
                    actions: "setCoverImageUrl"
                },
                SET_READING_TIME: {
                    actions: "setReadingTime"
                },
                SET_LANGUAGE: {
                    actions: "setLanguage"
                },
                SET_ISBN: {
                    actions: "setIsbn"
                },
                SET_PUBLICATION_DATE: {
                    actions: "setPublicationDate"
                },
                SET_PAGES: {
                    actions: "setPages"
                },
                SET_SAMPLE_CONTENT: {
                    actions: "setSampleContent"
                },
                CHANGE_TAB: {
                    actions: "changeTab"
                },
                SET_FORM_ERROR: {
                    actions: "setFormError"
                },
                INIT_DATA: {
                    actions: "initData"
                },
                SUBMIT: {
                    target: "validating"
                },
                RESET: {
                    actions: "resetForm"
                }
            }
        },
        validating: {
            always: [
                {
                    guard: "isTitleValid",
                    target: "submitting",
                    actions: "startSubmitting"
                },
                {
                    target: "editing",
                    actions: "setValidationError"
                }
            ]
        },
        submitting: {
            on: {
                SUBMIT_SUCCESS: {
                    target: "success",
                    actions: "submitSuccess"
                },
                SET_FORM_ERROR: {
                    target: "editing",
                    actions: "submitError"
                }
            }
        },
        success: {
            type: "final"
        }
    }
}); 