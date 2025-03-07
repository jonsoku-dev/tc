import { ParagraphBlockEditor } from "./paragraph-block";
import { HeadingBlockEditor } from "./heading-block";
import { ImageBlockEditor } from "./image-block";
import { CodeBlockEditor } from "./code-block";
import { MarkdownBlockEditor } from "./markdown-block";
import type { BlockEditorProps } from "../types";
import type { Block } from "../../types";

export function BlockEditor(props: BlockEditorProps) {
    const { block } = props;

    switch (block.type) {
        case "paragraph":
            return <ParagraphBlockEditor {...props} />;
        case "heading":
            return <HeadingBlockEditor {...props} />;
        case "image":
            return <ImageBlockEditor {...props} />;
        case "code":
            return <CodeBlockEditor {...props} />;
        case "markdown":
            return <MarkdownBlockEditor {...props} />;
        default:
            return <div>지원되지 않는 블록 타입입니다.</div>;
    }
}

export { ParagraphBlockEditor, HeadingBlockEditor, ImageBlockEditor, CodeBlockEditor, MarkdownBlockEditor }; 