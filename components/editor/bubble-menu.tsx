"use client";

import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
} from "lucide-react";
import { useCallback } from "react";
import { ToolbarButton } from "./toolbar-button";

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  return (
    <>
      <TiptapBubbleMenu
        editor={editor}
        shouldShow={({ editor: e, state }) => {
          const { from, to } = state.selection;
          return from !== to && !e.isActive("image") && !e.isActive("codeBlock");
        }}
      >
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background shadow-lg p-1">
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Tebal"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Miring"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Garis bawah"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Coret"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Kode inline"
          >
            <Code className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-0.5" />
          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Rata kiri"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Rata tengah"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Rata kanan"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-0.5" />
          <ToolbarButton
            active={editor.isActive("link")}
            onClick={setLink}
            title="Tautan"
          >
            <Link2 className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>
      </TiptapBubbleMenu>

      <TiptapBubbleMenu
        editor={editor}
        shouldShow={({ editor: e }) => e.isActive("image")}
      >
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background shadow-lg p-1">
          <ToolbarButton
            active={editor.getAttributes("image").style?.includes("float: left")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("image", { style: "float: left; margin: 0 1rem 0.5rem 0" })
                .run()
            }
            title="Gambar rata kiri"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.getAttributes("image").style?.includes("margin: 0 auto")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("image", { style: "display: block; margin: 0 auto" })
                .run()
            }
            title="Gambar rata tengah"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.getAttributes("image").style?.includes("float: right")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("image", { style: "float: right; margin: 0 0 0.5rem 1rem" })
                .run()
            }
            title="Gambar rata kanan"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>
      </TiptapBubbleMenu>
    </>
  );
}
