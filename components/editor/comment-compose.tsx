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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
    let handler: (e: MouseEvent) => void;
    const timer = setTimeout(() => {
      handler = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) onClose();
      };
      document.addEventListener("mousedown", handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      if (handler) document.removeEventListener("mousedown", handler);
    };
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
        {/* Header */}
          <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground">Komentar baru</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="ml-auto"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Input group: textarea + bottom action bar */}
        <InputGroup className="rounded-lg">
          <InputGroupTextarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis komentar…"
            rows={3}
            className="text-sm min-h-[72px] py-2.5 px-3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") onClose();
            }}
          />
          <InputGroupAddon
            align="block-end"
            className="justify-between border-t border-border px-2 py-1.5"
          >
            <InputGroupText className="text-[10px] text-muted-foreground/60">
              Ctrl+Enter
            </InputGroupText>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isPending}
              >
                Batal
              </Button>
              <InputGroupButton
                size="sm"
                variant="default"
                disabled={!text.trim() || isPending}
                onClick={handleSubmit}
                className="gap-1"
              >
                <Send className="size-3.5" />
                Kirim
              </InputGroupButton>
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </FloatingPortal>
  );
}
