/**
 * 이북 관련 쿼리 키 상수
 */
export const EBOOK_QUERY_KEYS = {
    // 이북 기본 정보
    EBOOK_DETAIL: (ebookId: string) => ['ebook', 'detail', ebookId],

    // 이북 페이지
    EBOOK_PAGES: (ebookId: string) => ['ebook', 'pages', ebookId],
    EBOOK_PAGE: (ebookId: string, pageNumber: number) => ['ebook', 'page', ebookId, pageNumber],

    // 하이라이트
    HIGHLIGHTS: (ebookId: string) => ['ebook', 'highlights', ebookId],
    HIGHLIGHTS_BY_PAGE: (ebookId: string, pageNumber: number) => ['ebook', 'highlights', ebookId, 'page', pageNumber],

    // 북마크
    BOOKMARKS: (ebookId: string) => ['ebook', 'bookmarks', ebookId],

    // 목차
    TOC: (ebookId: string) => ['ebook', 'toc', ebookId],
}; 