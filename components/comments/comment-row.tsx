"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { extractText, formatTime } from "./types";
import type { RawComment, UserInfo } from "./types";

interface CommentRowProps {
  comment: RawComment;
  author?: UserInfo;
  currentUserId: string;
  isOnly: boolean;
  onDelete: () => void;
}

export function CommentRow({
  comment,
  author,
  currentUserId,
  isOnly,
  onDelete,
}: CommentRowProps) {
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
          <span className="text-xs2 font-medium text-foreground">
            {author?.username ?? "User"}
          </span>
          <span className="text-xxs">{formatTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground leading-snug mt-0.5">
          {text || (
            <span className="italic text-muted-foreground text-xs">
              Komentar kosong
            </span>
          )}
        </p>
      </div>
      {isOwn && (
        <Button
          variant="destructive"
          size="icon-xs"
          title={isOnly ? "Hapus thread" : "Hapus komentar"}
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
}
