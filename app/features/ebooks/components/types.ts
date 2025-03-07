export interface Highlight {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
    color: string;
    note?: string;
    createdAt: Date;
}

export interface BookmarkItem {
    id: string;
    position: number;
    title: string;
    createdAt: Date;
}

export interface TocItem {
    id: string;
    title: string;
    level: number;
    position: number;
}

export interface Ebook {
    ebook_id: string;
    title: string;
    description: string;
    cover_image_url: string;
    table_of_contents: string[];
    content: string;
} 