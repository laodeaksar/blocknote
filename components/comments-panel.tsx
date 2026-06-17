"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

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

type UserInfo = {
  id: string;
  username: string;
  avatarUrl: string;
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CommentsPanel({ pageId, open, onOpenChange }: CommentsPanelProps) {
  const { data: threads, isPending } = useQuery(
    convexQuery(api.comments.listForPage, { pageId })
  );

  const threadList = (threads as RawThread[] | undefined) ?? [];
  const active = threadList.filter((t) => !t.resolved);
  const resolved = threadList.filter((t) => t.resolved);

  const userIds = useMemo(() => {
    const ids = new Set<string>();
    for (const thread of threadList) {
      const activeComments = thread.comments.filter((c) => !c.deletedAt);
      if (activeComments[0]) ids.add(activeComments[0].userId);
    }
    return Array.from(ids);
  }, [threadList]);

  const { data: users } = useQuery(
    convexQuery(api.comments.getUsersByIds, { userIds })
  );

  const usersMap = useMemo(() => {
    const map = new Map<string, UserInfo>();
    for (const u of (users as UserInfo[] | undefined) ?? []) {
      map.set(u.id, u);
    }
    return map;
  }, [users]);

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

          {isPending && (
            <div className="flex items-center justify-center py-10">
              <div className="w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          )}

          {!isPending && threadList.length === 0 && (
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
                <ThreadItem key={thread.id} thread={thread} usersMap={usersMap} />
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                Selesai ({resolved.length})
              </div>
              {resolved.map((thread) => (
                <ThreadItem key={thread.id} thread={thread} usersMap={usersMap} resolved />
              ))}
            </div>
          )}
      </SheetContent>
    </Sheet>
  );
}

function ThreadItem({
  thread,
  usersMap,
  resolved = false,
}: {
  thread: RawThread;
  usersMap: Map<string, UserInfo>;
  resolved?: boolean;
}) {
  const activeComments = thread.comments.filter((c) => !c.deletedAt);
  const first = activeComments[0];
  const text = extractText(first?.body);
  const replyCount = activeComments.length - 1;
  const author = first ? usersMap.get(first.userId) : undefined;

  const resolveThread = useConvexMutation(api.comments.resolveThread);
  const unresolveThread = useConvexMutation(api.comments.unresolveThread);

  const { mutate: resolve, isPending: resolving } = useMutation({
    mutationFn: resolveThread,
  });

  const { mutate: unresolve, isPending: unresolving } = useMutation({
    mutationFn: unresolveThread,
  });

  const threadId = thread.id as Id<"threads">;

  return (
    <div
      className={cn(
        "group px-4 py-3 border-b border-border/50 last:border-0",
        resolved ? "opacity-60" : "hover:bg-accent/40 transition-colors"
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          className="mt-0.5 shrink-0 cursor-pointer"
          title={resolved ? "Buka kembali" : "Tandai selesai"}
          disabled={resolving || unresolving}
          onClick={() => resolved ? unresolve({ threadId }) : resolve({ threadId })}
        >
          {resolved ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 hover:text-emerald-600 transition-colors" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-primary/60 hover:text-primary transition-colors" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Avatar size="sm" className="size-5">
              {author?.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.username} />}
              <AvatarFallback className="text-[9px]">
                {author ? getInitials(author.username) : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-medium text-foreground truncate">
              {author?.username ?? "User"}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              · {formatTime(first?.createdAt ?? thread.createdAt)}
            </span>
          </div>

          <p className="text-sm text-foreground line-clamp-3 leading-snug">
            {text || <span className="italic text-muted-foreground">Komentar tanpa teks</span>}
          </p>

          {(replyCount > 0 || resolved) && (
            <div className="flex items-center justify-between mt-1.5">
              {replyCount > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {replyCount} balasan
                </span>
              )}
              {resolved && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground ml-auto"
                  disabled={unresolving}
                  onClick={() => unresolve({ threadId })}
                >
                  <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
                  Buka
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
