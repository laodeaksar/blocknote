"use client";

import { useState, useRef } from "react";
import { useConvex } from "convex/react";
import { useMutation } from "@tanstack/react-query";
import { RateLimiter } from "@tanstack/pacer";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Globe, Lock, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

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

  const rateLimiterRef = useRef<RateLimiter<() => void> | null>(null);
  if (!rateLimiterRef.current) {
    rateLimiterRef.current = new RateLimiter(
      () => {},
      { limit: 3, window: 30_000 }
    );
  }

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${pageId}`
      : `/p/${pageId}`;

  const handleToggle = () => {
    const limiter = rateLimiterRef.current!;
    const prevRejections = limiter.store.state.rejectionCount;
    limiter.maybeExecute();

    if (limiter.store.state.rejectionCount > prevRejections) {
      const times = limiter.store.state.executionTimes;
      const oldest = times.length > 0 ? times[0] : Date.now();
      const retryIn = Math.max(1, Math.ceil((oldest + 30_000 - Date.now()) / 1000));
      toast.error(`Terlalu sering. Coba lagi dalam ${retryIn} detik.`);
      return;
    }

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
              ? "bg-success-foreground text-success"
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

      <LoadingButton
        onClick={handleToggle}
        isPending={isPending}
        loadingText="Saving..."
        variant={isPublished ? "outline" : "default"}
        className="w-full"
      >
        {isPublished ? "Unpublish" : "Publish to web"}
      </LoadingButton>

      {isPublished && (
        <div className="space-y-2">
          <InputGroup>
            <InputGroupInput placeholder={publicUrl} readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Copy link"
                title="Copy link"
                size="icon-xs"
                onClick={handleCopy}
              >
                {copied ? <Check /> : <Copy />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={buttonVariants({ variant: "ghost", size: "sm"})} >
            <ExternalLink data-icon="inline-start" />
            Open public page
          </a>
        </div>
      )}
    </div>
  );
}
