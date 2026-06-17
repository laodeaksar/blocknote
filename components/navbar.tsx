"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvex, useConvexConnectionState } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MoreHorizontal, Star, Share2, Check, Loader2, Pencil, PanelLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/lib/sidebar-context";
import { UserMenu } from "@/components/user-menu";
import { PublishPopover } from "@/components/publish-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavbarProps {
  pageId: Id<"pages">;
  commentsOpen?: boolean;
  onToggleComments?: () => void;
}

type SaveStatus = "idle" | "saving" | "saved";

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "Baru saja disimpan";
  if (seconds < 60) return `Disimpan ${seconds} dtk lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Disimpan ${minutes} mnt lalu`;
  return `Disimpan ${Math.floor(minutes / 60)} jam lalu`;
}

export function Navbar({ pageId, commentsOpen, onToggleComments }: NavbarProps) {
  const { toggle, collapsed } = useSidebar();
  const convex = useConvex();
  const { data: page, isPending, isError } = useQuery(convexQuery(api.pages.get, { id: pageId }));
  const { mutateAsync: updatePage } = useMutation({
    mutationFn: (vars: FunctionArgs<typeof api.pages.update>) =>
      convex.mutation(api.pages.update, vars),
    onError: () => toast.error("Failed to update page"),
  });

  const connectionState = useConvexConnectionState();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [, setTick] = useState(0);
  const [showPublish, setShowPublish] = useState(false);
  const prevInflightRef = useRef(connectionState.hasInflightRequests);
  const hasEverSavedRef = useRef(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const wasInflight = prevInflightRef.current;
    const isInflight = connectionState.hasInflightRequests;

    if (isInflight && !wasInflight) {
      hasEverSavedRef.current = true;
      setSaveStatus("saving");
    } else if (!isInflight && wasInflight && hasEverSavedRef.current) {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    }

    prevInflightRef.current = isInflight;
  }, [connectionState.hasInflightRequests]);

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(id);
  }, [saveStatus]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const startEditingTitle = () => {
    if (!page) return;
    setTitleDraft(page.title || "");
    setIsEditingTitle(true);
  };

  const commitTitle = async () => {
    if (!page) return;
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== page.title) {
      await updatePage({ id: pageId, title: trimmed });
    }
    setIsEditingTitle(false);
  };

  const cancelTitle = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTitle();
    } else if (e.key === "Escape") {
      cancelTitle();
    }
  };

  if (isPending || isError) {
    return (
      <nav className="h-12 flex items-center px-4 border-b border-border bg-background">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </nav>
    );
  }

  if (!page) return null;

  return (
    <nav className="h-12 flex items-center justify-between px-4 border-b border-border bg-background relative">
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggle}
                aria-label="Toggle sidebar"
                className="hidden md:inline-flex shrink-0"
              />
            }>
              <PanelLeft className={`w-4 h-4 transition-colors ${collapsed ? "text-foreground" : "text-muted-foreground"}`} />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Toggle sidebar <kbd className="ml-1 text-[10px] font-mono border border-border rounded px-1">[</kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {page.icon && <span className="text-sm shrink-0">{page.icon}</span>}

        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleTitleKeyDown}
            className="h-7 text-sm font-medium border-0 border-b border-border rounded-none shadow-none bg-transparent px-1 focus-visible:ring-0 focus-visible:border-primary min-w-0 flex-1"
            placeholder="Untitled"
            maxLength={100}
          />
        ) : (
          <button
            onClick={startEditingTitle}
            className="group flex items-center gap-1.5 min-w-0 text-left"
            title="Tap to rename"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {page.title || "Untitled"}
            </span>
            <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 shrink-0 transition-opacity" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {saveStatus === "saving" && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Menyimpan…
          </span>
        )}
        {saveStatus === "saved" && lastSavedAt && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="w-3 h-3 text-emerald-500" />
            {formatRelativeTime(lastSavedAt)}
          </span>
        )}

        <div className="flex items-center gap-1">
          <Popover open={showPublish} onOpenChange={setShowPublish}>
            <PopoverTrigger
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                page.isPublished
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                  : "border-border hover:bg-accent text-foreground"
              )}
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden sm:inline">
                {page.isPublished ? "Published" : "Share"}
              </span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <PublishPopover
                pageId={pageId}
                isPublished={page.isPublished ?? false}
                onClose={() => setShowPublish(false)}
              />
            </PopoverContent>
          </Popover>

          {onToggleComments && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Toggle comments"
                    onClick={onToggleComments}
                    className={commentsOpen ? "bg-accent text-foreground" : ""}
                  />
                }>
                  <MessageSquare className={`w-4 h-4 ${commentsOpen ? "text-foreground" : "text-muted-foreground"}`} />
                </TooltipTrigger>
                <TooltipContent side="bottom">Komentar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Favorite" />}>
                <Star className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="bottom">Favorite</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="More options" />}>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="bottom">More options</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
