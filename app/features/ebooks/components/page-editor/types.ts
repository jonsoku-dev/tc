import type { Block, BlockType } from "../types";

export interface PageItem {
    id: string;
    title: string;
    blocks: Block[];
    position: number;
}

export interface PageEditorProps {
    pages: PageItem[];
    editable?: boolean;
    onPagesChange?: (pages: PageItem[]) => void;
    className?: string;
}

export interface BlockEditorProps {
    pageId: string;
    block: Block;
    isExpanded: boolean;
    toggleBlockExpand: (id: string) => void;
    updateBlock: (pageId: string, blockId: string, updatedBlock: Partial<Block>) => void;
}

export interface PageItemProps {
    page: PageItem;
    index: number;
    editable: boolean;
    expandedPageId: string | null;
    activeDragId: string | null;
    togglePageExpand: (id: string) => void;
    updatePageTitle: (id: string, title: string) => void;
    removePage: (id: string) => void;
    addBlock: (pageId: string, blockType: BlockType) => void;
    provided: any;
    snapshot: any;
}

export interface BlockItemProps {
    pageId: string;
    block: Block;
    blockIndex: number;
    editable: boolean;
    expandedBlockId: string | null;
    activeDragId: string | null;
    toggleBlockExpand: (id: string) => void;
    removeBlock: (pageId: string, blockId: string) => void;
    updateBlock: (pageId: string, blockId: string, updatedBlock: Partial<Block>) => void;
    provided: any;
    snapshot: any;
} 