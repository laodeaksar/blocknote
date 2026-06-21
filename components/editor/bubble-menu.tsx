"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MessageSquare,
} from "lucide-react";
import { ToolbarButton } from "./toolbar-button";

interface EditorBubbleMenuProps {
  editor: Editor;
  onComment?: (rect: DOMRect) => void;
}

export function EditorBubbleMenu({ editor, onComment }: EditorBubbleMenuProps) {
  const handleLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan:", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleComment = () => {
    if (!onComment) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    onComment(new DOMRect(rect.x, rect.y, rect.width, rect.height));
  };

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-background px-1 py-0.5 shadow-lg ring-1 ring-foreground/5"
    >
      <ToolbarButton
        title="Tebal (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-3.5" />
      </ToolbarButton>

      <ToolbarButton
        title="Miring (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-3.5" />
      </ToolbarButton>

      <ToolbarButton
        title="Garis bawah (Ctrl+U)"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="size-3.5" />
      </ToolbarButton>

      <ToolbarButton
        title="Coretan"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-3.5" />
      </ToolbarButton>

      <ToolbarButton
        title="Kode inline"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="size-3.5" />
      </ToolbarButton>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <ToolbarButton
        title="Tautan"
        active={editor.isActive("link")}
        onClick={handleLink}
      >
        <Link className="size-3.5" />
      </ToolbarButton>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <ToolbarButton
        title="Rata kiri"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="size-3.5" />
      </ToolbarButton>

      <ToolbarButton
        title="Rata tengah"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="size-3.5" />
      </ToolbarButton>

      <ToolbarButton
        title="Rata kanan"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="size-3.5" />
      </ToolbarButton>

      {onComment && (
        <>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <ToolbarButton
            title="Tambah komentar"
            active={false}
            onClick={handleComment}
          >
            <MessageSquare className="size-3.5" />
          </ToolbarButton>
        </>
      )}
    </BubbleMenu>
  );
}
