"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RotateCcw, CheckCircle2, Circle } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { CommentInput } from "@/components/ui/comment-input";
import { UserAvatar } from "@/components/ui/avatar";
import { CommentRow } from "./comment-row";
import { extractText, formatTime, makeBody } from "./types";
import type { RawThread, UserInfo } from "./types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ThreadItemProps {
  thread: RawThread;
  usersMap: Map<string, UserInfo>;
  currentUserId: string;
  isActive: boolean;
  onActivate: () => void;
  resolved?: boolean;
}

export function ThreadItem({
  thread,
  usersMap,
  currentUserId,
  isActive,
  onActivate,
  resolved = false,
}: ThreadItemProps) {
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

  return (
    <div
      ref={itemRef}
      className={cn(
        "border-b border-border/50 last:border-0",
        isActive && !resolved ? "bg-primary/5" : "",
        resolved ? "opacity-60" : ""
      )}
    >
      <Accordion
        value={!resolved && expanded ? [thread.id] : []}
        onValueChange={(val) => {
          if (resolved) return;
          const isOpen = Array.isArray(val) && val.includes(thread.id);
          setExpanded(isOpen);
          if (isOpen) onActivate();
        }}
      >
        <AccordionItem value={thread.id} className="border-0">
          <AccordionTrigger
            disabled={resolved}
            className={cn(
              "w-full px-4 py-3 text-left outline-none items-start gap-0",
              !resolved
                ? "hover:bg-accent/30 cursor-pointer transition-colors"
                : "aria-disabled:opacity-100 **:data-[slot=accordion-trigger-icon]:hidden"
            )}
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon-sm"
                className="mt-0.5 shrink-0"
                title={resolved ? "Buka kembali" : "Tandai selesai"}
                disabled={resolving || unresolving}
                onClick={(e) => {
                  e.stopPropagation();
                  resolved ? unresolve({ threadId }) : resolve({ threadId });
                }}
              >
                {resolved ? (
                  <CheckCircle2 className="text-success hover:text-success/80 transition-colors" />
                ) : (
                  <Circle className="text-primary/50 hover:text-primary transition-colors" />
                )}
              </Button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <UserAvatar
                    name={author?.username}
                    avatarUrl={author?.avatarUrl}
                    size="sm"
                    className="size-5"
                  />
                  <span className="text-xs2 font-medium text-foreground truncate">
                    {author?.username ?? "User"}
                  </span>
                  <span className="text-xxs text-muted-foreground shrink-0">
                    · {formatTime(first?.createdAt ?? thread.createdAt)}
                  </span>
                </div>

                <p className={cn("text-sm text-foreground leading-snug", !expanded && "line-clamp-2")}>
                  {extractText(first?.body) || (
                    <span className="italic text-muted-foreground">Komentar kosong</span>
                  )}
                </p>

                {!expanded && (replies.length > 0 || resolved) && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {replies.length > 0 && (
                      <span className="text-xxs">{replies.length} balasan</span>
                    )}
                    {resolved && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-5 px-1.5 text-xxs ml-auto"
                        disabled={unresolving}
                        onClick={(e) => {
                          e.stopPropagation();
                          unresolve({ threadId });
                        }}
                      >
                        <RotateCcw data-icon="inline-start" />
                        Buka
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="!pb-0">
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

              <CommentInput
                className="mt-3"
                value={replyText}
                onChange={setReplyText}
                onSubmit={handleReply}
                placeholder="Tulis balasan…"
                disabled={sending}
                rows={2}
                textareaClassName="min-h-13"
                textareaRef={replyRef}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
