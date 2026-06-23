"use client";

import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import type { Content } from "@tiptap/react";
import type { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

import { usePresence } from "@/lib/use-presence";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useState, useCallback, useRef, useEffect } from "react";
import { useEditorContext } from "@/lib/editor-context";
import { EditorBubbleMenu } from "./bubble-menu";
import { BlockDragHandle } from "./block-drag-handle";
import { CommentCompose } from "./comment-compose";
import { CommentContextMenu } from "./comment-context-menu";
import { buildEditorExtensions } from "./use-editor-extensions";
import { ImageUploadButton, type ImageUploadButtonRef } from "./image-upload-button";

interface ComposeState {
  anchorRect: DOMRect;
  selectionRange: { from: number; to: number };
}

interface ContextMenuState {
  anchorRect: DOMRect;
  threadId: string;
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
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const imageUploadRef = useRef<ImageUploadButtonRef>(null);

  const handleImageUpload = useCallback(() => {
    imageUploadRef.current?.trigger();
  }, []);

  const { setEditor } = useEditorContext();

  const editor = useEditor({
    extensions: buildEditorExtensions(extension, handleImageUpload),
    content: initialContent,
    editable,
    immediatelyRender: false,
  });

  useEffect(() => {
    setEditor(editor ?? null);
    return () => setEditor(null);
  }, [editor, setEditor]);

  usePresence(editor ?? null, pageId, userId, userName, editable && !!userId);

  const handleComment = useCallback(
    (rect: DOMRect, from: number, to: number) => {
      if (!editor) return;
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
      if (threadId) onCommentsOpen?.(threadId);
    },
    [onCommentsOpen]
  );

  const handleEditorContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const mark = target.closest("mark[data-thread-id]");

      if (!mark) {
        // Not on a highlight — suppress native context menu, do nothing
        e.preventDefault();
        return;
      }

      const threadId = mark.getAttribute("data-thread-id");
      if (!threadId) { e.preventDefault(); return; }

      e.preventDefault(); // suppress native browser context menu

      // Position the floating menu at the cursor point
      const rect = new DOMRect(e.clientX, e.clientY, 0, 0);
      setContextMenu({ anchorRect: rect, threadId });
    },
    []
  );

  if (!editor) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <div className={cn(
    "tiptap-editor",
    resolvedTheme === "dark" ? "dark" : "",
    "group"
    )}>
      <ImageUploadButton ref={imageUploadRef} editor={editor} />
      <EditorBubbleMenu
        editor={editor}
        onComment={editable ? handleComment : undefined}
      />
      {editable && <BlockDragHandle editor={editor} />}

      <div onClick={handleEditorClick} onContextMenu={handleEditorContextMenu}>
        <EditorContent editor={editor} className="tiptap-content" />
      </div>

      {compose && (
        <CommentCompose
          pageId={pageId}
          anchorRect={compose.anchorRect}
          selectionRange={compose.selectionRange}
          editor={editor}
          onClose={() => setCompose(null)}
          onSuccess={handleComposeSuccess}
        />
      )}

      {contextMenu && (
        <CommentContextMenu
          threadId={contextMenu.threadId}
          anchorRect={contextMenu.anchorRect}
          editor={editor}
          onClose={() => setContextMenu(null)}
          onViewComments={(threadId) => {
            onCommentsOpen?.(threadId);
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}
