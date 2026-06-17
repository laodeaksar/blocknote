"use client";

import { useState, useRef, useEffect } from "react";
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
import { MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CommentComposeProps {
  pageId: Id<"pages">;
  anchorRect: DOMRect;
  selectionRange: { from: number; to: number };
  editor: Editor;
  onClose: () => void;
  onSuccess: (threadId: string) => void;
}

function makeBody(text: string) {
  return {
    version: 1,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

export function CommentCompose({
  pageId,
  anchorRect,
  selectionRange,
  editor,
  onClose,
  onSuccess,
}: CommentComposeProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 })],
    strategy: "fixed",
  });

  useEffect(() => {
    const virtualEl: VirtualElement = {
      getBoundingClientRect: () => anchorRect,
    };
    refs.setPositionReference(virtualEl);
  }, [anchorRect, refs]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 60);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const createThreadFn = useConvexMutation(api.comments.createThread);
  const { mutate: createThread, isPending } = useMutation({
    mutationFn: createThreadFn,
    onSuccess: (result) => {
      const threadId = (result as { id: string }).id;
      editor
        .chain()
        .setTextSelection({ from: selectionRange.from, to: selectionRange.to })
        .setMark("commentHighlight", { threadId })
        .run();
      toast.success("Komentar ditambahkan");
      onSuccess(threadId);
      onClose();
    },
    onError: () => toast.error("Gagal menambahkan komentar"),
  });

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    createThread({ pageId, body: makeBody(trimmed) });
  };

  return (
    <FloatingPortal>
      <div
        ref={(el) => {
          refs.setFloating(el);
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={floatingStyles}
        className="z-[9999] w-72 rounded-xl border border-border bg-background shadow-2xl p-3 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-2 mb-2.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground">Komentar baru</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis komentar… (Ctrl+Enter untuk kirim)"
          className="min-h-[80px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
            if (e.key === "Escape") onClose();
          }}
        />

        <div className="flex justify-end gap-1.5 mt-2.5">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!text.trim() || isPending}>
            <Send className="w-3 h-3 mr-1" />
            Kirim
          </Button>
        </div>
      </div>
    </FloatingPortal>
  );
}
