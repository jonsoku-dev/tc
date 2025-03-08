import { setup, assign } from "xstate";

export interface PageItem {
    position: number;
    title: string;
    blocks: any[];
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
    ebookId: string | null;
}

export const ebookFormMachine = setup({
    types: {
        context: {} as EbookFormContext,
        events: {} as
            | { type: "SET_TITLE"; value: string }
            | { type: "SET_DESCRIPTION"; value: string }
            | { type: "SET_PRICE"; value: string }
            | { type: "SET_STATUS"; value: string }
            | { type: "SET_IS_FEATURED"; value: boolean }
            | { type: "SET_COVER_IMAGE"; file: File }
            | { type: "SET_READING_TIME"; value: string }
            | { type: "SET_LANGUAGE"; value: string }
            | { type: "SET_ISBN"; value: string }
            | { type: "SET_PUBLICATION_DATE"; value: string }
            | { type: "SET_PAGES"; pages: PageItem[] }
            | { type: "SET_SAMPLE_CONTENT"; value: string }
            | { type: "CHANGE_TAB"; tab: string }
            | { type: "SET_FORM_ERROR"; error: string | null }
            | { type: "SUBMIT" }
            | { type: "SUBMIT_SUCCESS"; ebookId: string }
            | { type: "SUBMIT_ERROR"; error: string }
            | { type: "RESET" },
    },
}).createMachine({
    id: "ebookForm",
    context: {
        title: "",
        description: "",
        price: "",
        status: "draft",
        isFeatured: false,
        coverImageFile: null,
        coverImagePreview: null,
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
        ebookId: null
    },
    initial: "editing",
    states: {
        editing: {
            on: {
                SET_TITLE: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        title: event.value
                    }))
                },
                SET_DESCRIPTION: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        description: event.value
                    }))
                },
                SET_PRICE: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        price: event.value
                    }))
                },
                SET_STATUS: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        status: event.value
                    }))
                },
                SET_IS_FEATURED: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        isFeatured: event.value
                    }))
                },
                SET_COVER_IMAGE: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        coverImageFile: event.file,
                        coverImagePreview: event.file ? URL.createObjectURL(event.file) : null
                    }))
                },
                SET_READING_TIME: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        readingTime: event.value
                    }))
                },
                SET_LANGUAGE: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        language: event.value
                    }))
                },
                SET_ISBN: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        isbn: event.value
                    }))
                },
                SET_PUBLICATION_DATE: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        publicationDate: event.value
                    }))
                },
                SET_PAGES: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        pages: event.pages,
                        pageCount: event.pages.length.toString()
                    }))
                },
                SET_SAMPLE_CONTENT: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        sampleContent: event.value
                    }))
                },
                CHANGE_TAB: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        activeTab: event.tab
                    }))
                },
                SET_FORM_ERROR: {
                    actions: assign(({ context, event }) => ({
                        ...context,
                        formError: event.error
                    }))
                },
                SUBMIT: {
                    target: "validating"
                },
                RESET: {
                    actions: assign(() => ({
                        title: "",
                        description: "",
                        price: "",
                        status: "draft",
                        isFeatured: false,
                        coverImageFile: null,
                        coverImagePreview: null,
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
                        ebookId: null
                    }))
                }
            }
        },
        validating: {
            always: [
                {
                    guard: ({ context }) => context.title.trim() !== "",
                    target: "submitting",
                    actions: assign(({ context }) => ({
                        ...context,
                        isSubmitting: true
                    }))
                },
                {
                    target: "editing",
                    actions: assign(({ context }) => ({
                        ...context,
                        formError: "제목을 입력해주세요.",
                        activeTab: "basic"
                    }))
                }
            ]
        },
        submitting: {
            on: {
                SUBMIT_SUCCESS: {
                    target: "success",
                    actions: assign(({ context, event }) => ({
                        ...context,
                        isSubmitting: false,
                        isSuccess: true,
                        ebookId: event.ebookId
                    }))
                },
                SUBMIT_ERROR: {
                    target: "editing",
                    actions: assign(({ context, event }) => ({
                        ...context,
                        isSubmitting: false,
                        formError: event.error
                    }))
                }
            }
        },
        success: {
            type: "final"
        }
    }
}); 