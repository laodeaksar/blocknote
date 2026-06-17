"use client";

import { useState } from "react";
import { useConvex } from "convex/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Globe, Lock, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PublishPopoverProps {
  pageId: Id<"pages">;
  isPublished: boolean;
  onClose: () => void;
}

export function PublishPopover({
  pageId,
  isPublished,
  onClose,
}: PublishPopoverProps) {
  const convex = useConvex();
  const [copied, setCopied] = useState(false);

  const { mutate: updatePage, isPending } = useMutation({
    mutationFn: (vars: { id: Id<"pages">; isPublished: boolean }) =>
      convex.mutation(api.pages.update, vars),
    onSuccess: () => {
      toast.success(isPublished ? "Page unpublished" : "Page published to web!");
    },
  });

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${pageId}`
      : `/p/${pageId}`;

  const handleToggle = () => {
    updatePage({ id: pageId, isPublished: !isPublished });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-72 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isPublished
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isPublished ? (
            <Globe className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {isPublished ? "Published to web" : "Private page"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {isPublished
              ? "Anyone with the link can view this page."
              : "Only you can see this page."}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
          isPublished
            ? "bg-muted hover:bg-accent text-foreground"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        } disabled:opacity-50`}
      >
        {isPending
          ? "Saving..."
          : isPublished
            ? "Unpublish"
            : "Publish to web"}
      </button>

      {isPublished && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border border-border">
            <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
              {publicUrl}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 p-1 hover:bg-accent rounded transition-colors"
              title="Copy link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open public page
          </a>
        </div>
      )}
    </div>
  );
}
