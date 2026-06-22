"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  MessageSquare,
  CheckCircle2,
  Circle,
  RotateCcw,
  Send,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { UserAvatar } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useMemo, useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CommentsPanelProps {
  pageId: Id<"pages">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeThreadId?: string;
  onActiveThreadChange?: (threadId: string | undefined) => void;
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
  function walk(nodes: unknown[]) {
    for (const node of nodes as Array<{ type?: string; text?: string; content?: unknown[] }>) {
      if (node.type === "text" && typeof node.text === "string") parts.push(node.text);
      else if (node.content) walk(node.content);
    }
  }
  walk(body.content);
  return parts.join("").trim();
}

function makeBody(text: string) {
  return {
    version: 1,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
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


function PanelBody({
  isPending,
  threadList,
  active,
  resolved,
  usersMap,
  currentUserId,
  activeThreadId,
  onActiveThreadChange,
}: {
  isPending: boolean;
  threadList: RawThread[];
  active: RawThread[];
  resolved: RawThread[];
  usersMap: Map<string, UserInfo>;
  currentUserId: string;
  activeThreadId?: string;
  onActiveThreadChange?: (id: string | undefined) => void;
}) {
  return (
    <ScrollArea className="flex-1">
      {isPending && (
        <div className="flex items-center justify-center py-10">
          <div className="size-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        </div>
      )}

      {!isPending && threadList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 px-4 text-center">
          <MessageSquare className="size-8 text-muted" />
          <p className="text-sm text-muted-foreground">Belum ada komentar</p>
          <p className="text-xs text-muted-foreground/60">
            Pilih teks di dokumen lalu klik ikon 💬 untuk memulai.
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="py-1">
          {active.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              usersMap={usersMap}
              currentUserId={currentUserId}
              isActive={thread.id === activeThreadId}
              onActivate={() => onActiveThreadChange?.(thread.id)}
            />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="py-1">
          <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Selesai ({resolved.length})
          </div>
          {resolved.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              usersMap={usersMap}
              currentUserId={currentUserId}
              isActive={thread.id === activeThreadId}
              onActivate={() => onActiveThreadChange?.(thread.id)}
              resolved
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

export function CommentsPanel({
  pageId,
  open,
  onOpenChange,
  activeThreadId,
  onActiveThreadChange,
}: CommentsPanelProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";

  const { data: threads, isPending } = useQuery(
    convexQuery(api.comments.listForPage, { pageId })
  );

  const threadList = (threads as RawThread[] | undefined) ?? [];
  const active = threadList.filter((t) => !t.resolved);
  const resolved = threadList.filter((t) => t.resolved);

  const userIds = useMemo(() => {
    const ids = new Set<string>();
    for (const thread of threadList) {
      for (const c of thread.comments) {
        if (!c.deletedAt) ids.add(c.userId);
      }
    }
    return Array.from(ids);
  }, [threadList]);

  const { data: users } = useQuery(
    convexQuery(api.comments.getUsersByIds, { userIds })
  );

  const usersMap = useMemo(() => {
    const map = new Map<string, UserInfo>();
    for (const u of (users as UserInfo[] | undefined) ?? []) map.set(u.id, u);
    return map;
  }, [users]);

  const bodyProps = {
    isPending,
    threadList,
    active,
    resolved,
    usersMap,
    currentUserId,
    activeThreadId,
    onActiveThreadChange,
  };

  const headerContent = (
    <div className="flex items-center gap-2">
      <MessageSquare className="size-4 text-muted-foreground" />
      <span className="text-sm font-medium">Komentar</span>
      {active.length > 0 && (
        <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium leading-none">
          {active.length}
        </span>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex flex-col max-h-[85vh]">
          <DrawerHeader className="px-4 py-3 border-b border-border shrink-0 !text-left gap-0">
            <DrawerTitle className="sr-only">Komentar</DrawerTitle>
            {headerContent}
          </DrawerHeader>
          <PanelBody {...bodyProps} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col gap-0" swipeToClose={false}>
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="sr-only">Komentar</SheetTitle>
          {headerContent}
        </SheetHeader>
        <PanelBody {...bodyProps} />
      </SheetContent>
    </Sheet>
  );
}

function ThreadItem({
  thread,
  usersMap,
  currentUserId,
  isActive,
  onActivate,
  resolved = false,
}: {
  thread: RawThread;
  usersMap: Map<string, UserInfo>;
  currentUserId: string;
  isActive: boolean;
  onActivate: () => void;
  resolved?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const activeComments = thread.comments.filter((c) => !c.deletedAt);
  const first = activeComments[0];
  const replies = activeComments.slice(1);
  const author = first ? usersMap.get(first.userId) : undefined;
  const threadId = thread.id as Id<"threads">;

  useEffect(() => {
    if (isActive && !expanded) {
      setExpanded(true);
      setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
    }
  }, [isActive, expanded]);

  useEffect(() => {
    if (expanded && !resolved) {
      setTimeout(() => replyRef.current?.focus(), 100);
    }
  }, [expanded, resolved]);

  const resolveThread = useConvexMutation(api.comments.resolveThread);
  const unresolveThread = useConvexMutation(api.comments.unresolveThread);
  const addCommentFn = useConvexMutation(api.comments.addComment);
  const deleteCommentFn = useConvexMutation(api.comments.deleteComment);
  const deleteThreadFn = useConvexMutation(api.comments.deleteThread);

  const { mutate: resolve, isPending: resolving } = useMutation({ mutationFn: resolveThread });
  const { mutate: unresolve, isPending: unresolving } = useMutation({ mutationFn: unresolveThread });
  const { mutate: addComment, isPending: sending } = useMutation({
    mutationFn: addCommentFn,
    onSuccess: () => setReplyText(""),
    onError: () => toast.error("Gagal mengirim balasan"),
  });
  const { mutate: deleteComment } = useMutation({
    mutationFn: deleteCommentFn,
    onError: () => toast.error("Gagal menghapus komentar"),
  });
  const { mutate: deleteThread } = useMutation({
    mutationFn: deleteThreadFn,
    onError: () => toast.error("Gagal menghapus thread"),
  });

  const handleReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    addComment({ threadId, body: makeBody(trimmed) });
  };

  const handleDeleteComment = (commentId: string, isOnly: boolean) => {
    if (isOnly) {
      deleteThread({ threadId });
    } else {
      deleteComment({ commentId: commentId as Id<"comments">, threadId });
    }
  };

  const handleToggle = () => {
    if (!resolved) {
      const next = !expanded;
      setExpanded(next);
      if (next) onActivate();
    }
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        "border-b border-border/50 last:border-0 transition-colors",
        isActive && !resolved ? "bg-primary/5" : "",
        resolved ? "opacity-60" : ""
      )}
    >
      <div
        className={cn(
          "px-4 py-3",
          !resolved && "hover:bg-accent/30 cursor-pointer"
        )}
        onClick={handleToggle}
      >
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            className="mt-0.5 shrink-0"
            title={resolved ? "Buka kembali" : "Tandai selesai"}
            disabled={resolving || unresolving}
            onClick={(e) => {
              e.stopPropagation();
              resolved ? unresolve({ threadId }) : resolve({ threadId });
            }}
          >
            {resolved ? (
              <CheckCircle2 className="size-3.5 text-success hover:text-success/80 transition-colors" />
            ) : (
              <Circle className="size-3.5 text-primary/50 hover:text-primary transition-colors" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <UserAvatar
                name={author?.username}
                avatarUrl={author?.avatarUrl}
                size="sm"
                className="size-5"
              />
              <span className="text-[11px] font-medium text-foreground truncate">
                {author?.username ?? "User"}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                · {formatTime(first?.createdAt ?? thread.createdAt)}
              </span>
              {!resolved && (
                <span className="ml-auto shrink-0">
                  {expanded ? (
                    <ChevronUp className="size-3 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-3 text-muted-foreground" />
                  )}
                </span>
              )}
            </div>

            <p className={cn("text-sm text-foreground leading-snug", !expanded && "line-clamp-2")}>
              {extractText(first?.body) || (
                <span className="italic text-muted-foreground">Komentar kosong</span>
              )}
            </p>

            {!expanded && (replies.length > 0 || resolved) && (
              <div className="flex items-center gap-2 mt-1.5">
                {replies.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {replies.length} balasan
                  </span>
                )}
                {resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground ml-auto"
                    disabled={unresolving}
                    onClick={(e) => { e.stopPropagation(); unresolve({ threadId }); }}
                  >
                    <RotateCcw className="size-2.5 mr-0.5" />
                    Buka
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && !resolved && (
        <div className="px-4 pb-3" onClick={(e) => e.stopPropagation()}>
          {first && (
            <CommentRow
              comment={first}
              author={author}
              currentUserId={currentUserId}
              isOnly={activeComments.length === 1}
              onDelete={() => handleDeleteComment(first.id, activeComments.length === 1)}
            />
          )}

          {replies.length > 0 && (
            <div className="mt-2 pl-2 border-l-2 border-border space-y-1">
              {replies.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  author={usersMap.get(c.userId)}
                  currentUserId={currentUserId}
                  isOnly={false}
                  onDelete={() => handleDeleteComment(c.id, false)}
                />
              ))}
            </div>
          )}

          <InputGroup className="mt-3 rounded-lg">
            <InputGroupTextarea
              ref={replyRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tulis balasan…"
              rows={2}
              className="text-sm min-h-[52px] py-2 px-3"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <InputGroupAddon
              align="block-end"
              className="justify-between border-t border-border px-2 py-1"
            >
              <InputGroupText className="text-[10px] text-muted-foreground/60">
                Ctrl+Enter
              </InputGroupText>
              <InputGroupButton
                size="xs"
                variant="default"
                disabled={!replyText.trim() || sending}
                onClick={handleReply}
                className="gap-1 px-2"
              >
                <Send className="size-3" />
                Kirim
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      )}
    </div>
  );
}

function CommentRow({
  comment,
  author,
  currentUserId,
  isOnly,
  onDelete,
}: {
  comment: RawComment;
  author?: UserInfo;
  currentUserId: string;
  isOnly: boolean;
  onDelete: () => void;
}) {
  const text = extractText(comment.body);
  const isOwn = comment.userId === currentUserId;

  return (
    <div className="group flex items-start gap-2 py-1.5">
      <UserAvatar
        name={author?.username}
        avatarUrl={author?.avatarUrl}
        size="sm"
        className="size-5 mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] font-medium text-foreground">{author?.username ?? "User"}</span>
          <span className="text-[10px] text-muted-foreground">{formatTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground leading-snug mt-0.5">
          {text || <span className="italic text-muted-foreground text-xs">Komentar kosong</span>}
        </p>
      </div>
      {isOwn && (
        <button
          type="button"
          title={isOnly ? "Hapus thread" : "Hapus komentar"}
          onClick={onDelete}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive mt-0.5"
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  );
}
