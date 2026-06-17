"use client";

import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import type { Content } from "@tiptap/react";
import type { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/lib/theme";
import { usePresence } from "@/lib/use-presence";
import { Spinner } from "@/components/ui/spinner";
import { EditorBubbleMenu } from "./bubble-menu";
import { BlockDragHandle } from "./block-drag-handle";
import { buildEditorExtensions } from "./use-editor-extensions";

interface EditorInnerProps {
  pageId: Id<"pages">;
  editable: boolean;
  extension: AnyExtension;
  initialContent: Content;
  userId: string;
  userName: string;
}

export function EditorInner({
  pageId,
  editable,
  extension,
  initialContent,
  userId,
  userName,
}: EditorInnerProps) {
  const { resolvedTheme } = useTheme();

  const editor = useEditor({
    extensions: buildEditorExtensions(extension),
    content: initialContent,
    editable,
    immediatelyRender: false,
  });

  usePresence(editor ?? null, pageId, userId, userName, editable && !!userId);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className={`tiptap-editor ${resolvedTheme === "dark" ? "dark" : ""} group`}>
      <EditorBubbleMenu editor={editor} />
      {editable && <BlockDragHandle editor={editor} />}
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
}
