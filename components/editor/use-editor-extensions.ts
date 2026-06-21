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
import Typography from "@tiptap/extension-typography";
import type { Node } from "@tiptap/pm/model";
import { SlashExtension } from "@/lib/slash-extension";
import { CommentHighlight } from "./comment-highlight-extension";

export function buildEditorExtensions(syncExtension: AnyExtension): AnyExtension[] {
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
    }).configure({ HTMLAttributes: { class: "tiptap-image" } }),
    Typography,
    SlashExtension,
    CommentHighlight,
    syncExtension,
  ];
}
