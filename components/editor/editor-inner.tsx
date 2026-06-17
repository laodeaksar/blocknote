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

interface ComposeState {
  anchorRect: DOMRect;
  selectionRange: { from: number; to: number };
}

interface EditorInnerProps {
  pageId: Id<"pages">;
  editable: boolean;
  extension: AnyExtension;
  initialContent: Content;
  userId: string;
  userName: string;
  onCommentsOpen?: (threadId?: string) => void;
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
  const [compose, setCompose] = useState<ComposeState | null>(null);

  const editor = useEditor({
    extensions: buildEditorExtensions(extension),
    content: initialContent,
    editable,
    immediatelyRender: false,
  });

  usePresence(editor ?? null, pageId, userId, userName, editable && !!userId);

  const handleComment = useCallback(
    (rect: DOMRect) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from === to) return;
      setCompose({ anchorRect: rect, selectionRange: { from, to } });
    },
    [editor]
  );

  const handleComposeSuccess = useCallback(
    (threadId: string) => {
      onCommentsOpen?.(threadId);
    },
    [onCommentsOpen]
  );

  const handleEditorClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const mark = target.closest("mark[data-thread-id]");
      if (!mark) return;
      const threadId = mark.getAttribute("data-thread-id");
      if (threadId) {
        onCommentsOpen?.(threadId);
      }
    },
    [onCommentsOpen]
  );

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
      <div onClick={handleEditorClick}>
        <EditorContent editor={editor} className="tiptap-content" />
      </div>

      {compose && editor && (
        <CommentCompose
          pageId={pageId}
          anchorRect={compose.anchorRect}
          selectionRange={compose.selectionRange}
          editor={editor}
          onClose={() => setCompose(null)}
          onSuccess={handleComposeSuccess}
        />
      )}
    </div>
  );
}
