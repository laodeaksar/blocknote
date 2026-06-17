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

const PLACEHOLDER_MAP: Record<string, string | ((node: Node) => string)> = {
  paragraph: "Ketik '/' untuk perintah, atau mulai menulis…",
  heading: (node: Node) => {
    const level = node.attrs.level as number;
    if (level === 1) return "Judul utama…";
    if (level === 2) return "Subjudul…";
    return "Judul kecil…";
  },
  codeBlock: "// Tulis kode di sini…",
  blockquote: "Tulis kutipan…",
};

function getPlaceholder(node: Node): string {
  const entry = PLACEHOLDER_MAP[node.type.name];
  if (!entry) return "";
  if (typeof entry === "function") return entry(node);
  return entry;
}

export function buildEditorExtensions(syncExtension: AnyExtension): AnyExtension[] {
  return [
    StarterKit.configure({}),
    Underline,
    TextStyle,
    Color,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({
      placeholder: ({ node }) => getPlaceholder(node),
      includeChildren: false,
      showOnlyCurrent: true,
    }),
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
