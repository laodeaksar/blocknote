"use client";

import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import type { Content } from "@tiptap/react";
import type { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/lib/theme";
import { usePresence } from "@/lib/use-presence";
import { Spinner } from "@/components/ui/spinner";
import { useState, useCallback } from "react";
import { EditorBubbleMenu } from "./bubble-menu";
import { BlockDragHandle } from "./block-drag-handle";
import { CommentCompose } from "./comment-compose";
import { buildEditorExtensions } from "./use-editor-extensions";

interface EditorInnerProps {
  pageId: Id<"pages">;
  editable: boolean;
  extension: AnyExtension;
  initialContent: Content;
  userId: string;
  userName: string;
  onCommentsOpen?: () => void;
}

export function EditorInner({
  pageId,
  editable,
  extension,
  initialContent,
  userId,
  userName,
  onCommentsOpen,
}: EditorInnerProps) {
  const { resolvedTheme } = useTheme();
  const [composeAnchor, setComposeAnchor] = useState<DOMRect | null>(null);

  const editor = useEditor({
    extensions: buildEditorExtensions(extension),
    content: initialContent,
    editable,
    immediatelyRender: false,
  });

  usePresence(editor ?? null, pageId, userId, userName, editable && !!userId);

  const handleComment = useCallback((rect: DOMRect) => {
    setComposeAnchor(rect);
  }, []);

  const handleComposeSuccess = useCallback(() => {
    onCommentsOpen?.();
  }, [onCommentsOpen]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className={`tiptap-editor ${resolvedTheme === "dark" ? "dark" : ""} group`}>
      <EditorBubbleMenu
        editor={editor}
        onComment={editable ? handleComment : undefined}
      />
      {editable && <BlockDragHandle editor={editor} />}
      <EditorContent editor={editor} className="tiptap-content" />

      {composeAnchor && (
        <CommentCompose
          pageId={pageId}
          anchorRect={composeAnchor}
          onClose={() => setComposeAnchor(null)}
          onSuccess={handleComposeSuccess}
        />
      )}
    </div>
  );
}
