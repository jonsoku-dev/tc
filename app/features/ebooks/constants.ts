// ebooks/constants.ts
export const EBOOK_STATUS = ["draft", "published", "archived"] as const;

// 페이지 콘텐츠 타입 정의
export const PAGE_CONTENT_TYPE = [
    "text",
    "image",
    "table",
    "code",
    "video",
    "audio",
    "mixed"
] as const;

// 페이지 콘텐츠 타입별 스키마 정의
export const PAGE_CONTENT_SCHEMA = {
    text: {
        content: "", // 마크다운 텍스트
        style: {}, // 스타일 옵션
    },
    image: {
        url: "",
        alt: "",
        caption: "",
        width: 0,
        height: 0,
    },
    table: {
        headers: [], // 테이블 헤더
        rows: [], // 테이블 행
        caption: "",
    },
    code: {
        language: "",
        code: "",
        caption: "",
    },
    video: {
        url: "",
        caption: "",
        autoplay: false,
        controls: true,
    },
    audio: {
        url: "",
        caption: "",
        autoplay: false,
        controls: true,
    },
    mixed: {
        blocks: [], // 여러 타입의 콘텐츠 블록
    },
};