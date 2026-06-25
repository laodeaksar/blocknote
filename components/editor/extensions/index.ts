import type { AnyExtension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { SlashExtension } from "./slash-extension";
import { CommentHighlight } from "./comment-highlight";
import { ImageUploadExtension } from "./image-upload";
import { ImageDropPasteExtension } from "./image-drop-paste";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ImageNodeView } from "../image-node-view";
import { CodeBlockNodeView } from "../code-block-node-view";

const lowlight = createLowlight(common);

export function buildEditorExtensions(
  syncExtension: AnyExtension,
  onImageUpload?: () => void
): AnyExtension[] {
  return [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockNodeView);
      },
    }).configure({ lowlight, defaultLanguage: "plaintext" }),
    Underline,
    TextStyle,
    Color,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Link.configure({ openOnClick: false, autolink: true }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          style: { default: null },
          align: { default: "left" },
        };
      },
      addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
      },
    }).configure({ HTMLAttributes: { class: "tiptap-image" } }),
    Typography,
    SlashExtension,
    CommentHighlight,
    ImageUploadExtension.configure({ onTrigger: onImageUpload ?? null }),
    ImageDropPasteExtension.configure({ onUpload: uploadToCloudinary }),
    syncExtension,
  ];
}

export { CommentHighlight } from "./comment-highlight";
export { SlashExtension } from "./slash-extension";
export { ImageUploadExtension } from "./image-upload";
export { ImageDropPasteExtension } from "./image-drop-paste";
export { createCursorPlugin, remoteCursorsKey } from "./cursor-plugin";
export type { RemoteCursor } from "./cursor-plugin";
