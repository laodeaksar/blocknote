"use client";

import { useRef, useEffect } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  FloatingPortal,
  type VirtualElement,
} from "@floating-ui/react";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Editor } from "@tiptap/react";
import { CheckCircle2, MessageSquare, Highlighter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CommentContextMenuProps {
  threadId: string;
  anchorRect: DOMRect;
  editor: Editor;
  onClose: () => void;
  onViewComments: (threadId: string) => void;
}

export function removeCommentMark(editor: Editor, threadId: string) {
  const { doc, tr } = editor.state;
  let modified = false;
  doc.descendants((node, pos) => {
    if (!node.isInline) return;
    const mark = node.marks.find(
      (m) => m.type.name === "commentHighlight" && m.attrs.threadId === threadId
    );
    if (mark) {
      tr.removeMark(pos, pos + node.nodeSize, mark.type);
      modified = true;
    }
  });
  if (modified) editor.view.dispatch(tr);
}

export function CommentContextMenu({
  threadId,
  anchorRect,
  editor,
  onClose,
  onViewComments,
}: CommentContextMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    strategy: "fixed",
  });

  useEffect(() => {
    const virtualEl: VirtualElement = { getBoundingClientRect: () => anchorRect };
    refs.setPositionReference(virtualEl);
  }, [anchorRect, refs]);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const resolveThreadFn = useConvexMutation(api.comments.resolveThread);
  const { mutate: resolveThread, isPending } = useMutation({
    mutationFn: resolveThreadFn,
    onSuccess: () => {
      removeCommentMark(editor, threadId);
      toast.success("Thread ditandai selesai");
      onClose();
    },
    onError: () => toast.error("Gagal menyelesaikan thread"),
  });

  return (
    <FloatingPortal>
      <div
        ref={(el) => {
          refs.setFloating(el);
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={floatingStyles}
        className="z-[9999] min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 duration-100"
      >
        {/* Label */}
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 select-none">
          Komentar 
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-success"
          onClick={() => resolveThread({ threadId: threadId as Id<"threads"> })}
          disabled={isPending}
        >
          <CheckCircle2 data-icon="inline-start" />
          Tandai selesai
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => { onViewComments(threadId); onClose(); }}
        >
          <MessageSquare data-icon="inline-start" />
          Lihat komentar
        </Button>

        <div className="-mx-1 my-1 h-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => { removeCommentMark(editor, threadId); onClose(); }}
        >
          <Highlighter />
        </Button>
      </div>
    </FloatingPortal>
  );
}
