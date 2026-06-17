"use client";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, CheckCircle2, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface CommentsPanelProps {
  pageId: Id<"pages">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RawComment = {
  id: string;
  userId: string;
  body?: { version: number; content: unknown[] };
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  reactions: unknown[];
};

type RawThread = {
  id: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
  comments: RawComment[];
};

function extractText(body?: { version: number; content: unknown[] }): string {
  if (!body?.content) return "";
  const parts: string[] = [];
  for (const node of body.content as Array<{ type?: string; text?: string; content?: unknown[] }>) {
    if (node.type === "text" && typeof node.text === "string") {
      parts.push(node.text);
    } else if (node.content) {
      for (const child of node.content as Array<{ type?: string; text?: string }>) {
        if (child.type === "text" && typeof child.text === "string") {
          parts.push(child.text);
        }
      }
    }
  }
  return parts.join("").trim();
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export function CommentsPanel({ pageId, open, onOpenChange }: CommentsPanelProps) {
  const { data: threads, isPending } = useQuery(
    convexQuery(api.comments.listForPage, { pageId })
  );

  const active = (threads as RawThread[] | undefined)?.filter((t) => !t.resolved) ?? [];
  const resolved = (threads as RawThread[] | undefined)?.filter((t) => t.resolved) ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col gap-0">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <SheetTitle className="text-sm font-medium">Komentar</SheetTitle>
            {active.length > 0 && (
              <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium leading-none">
                {active.length}
              </span>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isPending && (
            <div className="flex items-center justify-center py-10">
              <div className="w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          )}

          {!isPending && (threads as RawThread[] | undefined)?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 px-4 text-center">
              <MessageSquare className="w-8 h-8 text-muted" />
              <p className="text-sm text-muted-foreground">Belum ada komentar</p>
              <p className="text-xs text-muted-foreground/60">
                Pilih teks di dokumen lalu klik ikon komentar untuk memulai.
              </p>
            </div>
          )}

          {active.length > 0 && (
            <div className="py-2">
              {active.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} />
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                Selesai ({resolved.length})
              </div>
              {resolved.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} resolved />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ThreadItem({ thread, resolved = false }: { thread: RawThread; resolved?: boolean }) {
  const activeComments = thread.comments.filter((c) => !c.deletedAt);
  const first = activeComments[0];
  const text = extractText(first?.body);
  const replyCount = activeComments.length - 1;

  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-border/50 last:border-0",
        resolved ? "opacity-60" : "hover:bg-accent/40 transition-colors"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">
          {resolved ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-primary/60" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground line-clamp-3 leading-snug">
            {text || <span className="italic text-muted-foreground">Komentar tanpa teks</span>}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">
              {formatTime(first?.createdAt ?? thread.createdAt)}
            </span>
            {replyCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                · {replyCount} balasan
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
