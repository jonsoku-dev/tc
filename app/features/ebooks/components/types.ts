import { PAGE_CONTENT_TYPE } from "../constants";

export interface Highlight {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    color: string;
    note?: string;
    createdAt: Date;
    pageNumber: number;
}

export interface BookmarkItem {
    id: string;
    position: number;
    title: string;
    createdAt: Date;
    pageNumber: number;
}

export interface TocItem {
    id: string;
    title: string;
    level: number;
    position: number;
    pageNumber: number;
}

export interface Ebook {
    ebook_id: string;
    title: string;
    description: string;
    cover_image_url: string;
    page_count: number;
    pages: EbookPage[];
}

export type PageContentType = typeof PAGE_CONTENT_TYPE[number];

export interface EbookPage {
    page_id: string;
    ebook_id: string;
    page_number: number;
    position: number;
    title?: string;
    content_type: PageContentType;
    content: PageContent;
    created_at: string;
    updated_at: string;
}

export type PageContent =
    | TextContent
    | ImageContent
    | TableContent
    | CodeContent
    | VideoContent
    | AudioContent
    | MixedContent;

export interface TextContent {
    content: string; // 마크다운 텍스트
    style?: Record<string, any>; // 스타일 옵션
}

export interface ImageContent {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
}

export interface TableContent {
    headers: string[];
    rows: string[][];
    caption?: string;
}

export interface CodeContent {
    language: string;
    code: string;
    caption?: string;
}

export interface VideoContent {
    url: string;
    caption?: string;
    autoplay?: boolean;
    controls?: boolean;
}

export interface AudioContent {
    url: string;
    caption?: string;
    autoplay?: boolean;
    controls?: boolean;
}

export interface MixedContent {
    blocks: Array<{
        type: PageContentType;
        content: PageContent;
    }>;
} 