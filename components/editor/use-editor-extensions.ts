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
import { SlashExtension } from "@/lib/slash-extension";
import { CommentHighlight } from "./comment-highlight-extension";
import { ImageUploadExtension } from "@/lib/image-upload-extension";
import { ImageDropPasteExtension } from "@/lib/image-drop-paste-extension";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ImageNodeView } from "./image-node-view";

export function buildEditorExtensions(
  syncExtension: AnyExtension,
  onImageUpload?: () => void
): AnyExtension[] {
  return [
    StarterKit.configure({}),
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
