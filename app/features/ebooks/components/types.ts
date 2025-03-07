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

export type BlockType =
    | "paragraph"
    | "heading"
    | "image"
    | "code"
    | "table"
    | "video"
    | "audio"
    | "markdown";

export interface BaseBlock {
    id: string;
    type: BlockType;
    position: number;
}

export interface ParagraphBlock extends BaseBlock {
    type: "paragraph";
    content: string;
    style?: {
        fontSize?: string;
        lineHeight?: string;
        textAlign?: "left" | "center" | "right" | "justify";
        fontWeight?: "normal" | "bold";
        fontStyle?: "normal" | "italic";
    };
}

export interface HeadingBlock extends BaseBlock {
    type: "heading";
    content: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageBlock extends BaseBlock {
    type: "image";
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
}

export interface CodeBlock extends BaseBlock {
    type: "code";
    code: string;
    language?: string;
    caption?: string;
}

export interface TableBlock extends BaseBlock {
    type: "table";
    headers: string[];
    rows: string[][];
    caption?: string;
}

export interface VideoBlock extends BaseBlock {
    type: "video";
    url: string;
    caption?: string;
    controls?: boolean;
    autoplay?: boolean;
}

export interface AudioBlock extends BaseBlock {
    type: "audio";
    url: string;
    caption?: string;
    controls?: boolean;
    autoplay?: boolean;
}

export interface MarkdownBlock extends BaseBlock {
    type: "markdown";
    content: string;
}

export type Block =
    | ParagraphBlock
    | HeadingBlock
    | ImageBlock
    | CodeBlock
    | TableBlock
    | VideoBlock
    | AudioBlock
    | MarkdownBlock;

export interface EbookPage {
    page_id: string;
    ebook_id: string;
    page_number: number;
    position: number;
    title: string;
    blocks: Block[];
    created_at?: string;
    updated_at?: string;
}

export type PageContentType = typeof PAGE_CONTENT_TYPE[number];

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