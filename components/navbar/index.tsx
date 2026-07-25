"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Debouncer } from "@tanstack/pacer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useConvexConnectionState } from "convex/react";
import { Check, Loader2, MessageSquare, PanelLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSidebar } from "@/lib/sidebar-context";
import { useEditorContext } from "@/lib/editor-context";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { UserMenu } from "@/components/user-menu";
import { NavbarTitle } from "@/components/navbar/title";
import { NavbarMoreMenu } from "@/components/navbar/more-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavbarProps {
  pageId: Id<"pages">;
  commentsOpen?: boolean;
  onToggleComments?: () => void;
}

type SaveStatus = "idle" | "saving" | "saved";

export function Navbar({ pageId, commentsOpen, onToggleComments }: NavbarProps) {
  const { toggle, collapsed } = useSidebar();
  const { editor } = useEditorContext();
  const { data: page, isPending, isError } = useQuery(convexQuery(api.pages.get, { id: pageId }));
  const { data: activeThreadCount = 0 } = useQuery(convexQuery(api.comments.countActiveThreads, { pageId })) as {
    data: number | undefined;
  };
  const { mutateAsync: updatePage } = useMutation({
    mutationFn: useConvexMutation(api.pages.update),
    onError: () => toast.error("Failed to update page"),
  });

  const connectionState = useConvexConnectionState();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [, setTick] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const prevInflightRef = useRef(connectionState.hasInflightRequests);
  const hasEverSavedRef = useRef(false);

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

  const debouncedWordCount = useMemo(
    () =>
      new Debouncer(
        (text: string) => {
          const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
          setWordCount(words);
        },
        { wait: 300, leading: false, trailing: true }
      ),
    []
  );

  useEffect(() => {
    if (!editor) return;
    const update = () => debouncedWordCount.maybeExecute(editor.getText());
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
      debouncedWordCount.cancel();
    };
  }, [editor, debouncedWordCount]);

  const commitTitle = async (newTitle: string) => {
    await updatePage({ id: pageId, title: newTitle });
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
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggle}
                  aria-label="Toggle sidebar"
                  className="hidden md:inline-flex shrink-0"
                />
              }
            >
              <PanelLeft className={cn("size-4 transition-colors", collapsed ? "text-foreground" : "text-muted-foreground")} />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Toggle sidebar <Kbd data-icon="inline-end">[</Kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {page.icon && <span className="text-sm shrink-0">{page.icon}</span>}

        <NavbarTitle title={page.title || ""} onCommit={commitTitle} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {wordCount > 0 && (
          <span className="hidden md:inline text-xs text-muted-foreground tabular-nums">
            {wordCount.toLocaleString("id")} kata
            {" · "}
            {Math.max(1, Math.ceil(wordCount / 200))} mnt baca
          </span>
        )}
        {saveStatus === "saving" && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin shrink-0" />
            <span className="hidden sm:inline">Menyimpan…</span>
          </span>
        )}
        {saveStatus === "saved" && lastSavedAt && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="size-3 text-success shrink-0" />
            <span className="hidden sm:inline">{formatRelativeTime(lastSavedAt)}</span>
          </span>
        )}

        <div className="flex items-center gap-1">
          {onToggleComments && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Toggle comments"
                      onClick={onToggleComments}
                      className={cn("relative", commentsOpen ? "bg-accent text-foreground" : "")}
                    />
                  }
                >
                  <MessageSquare className={cn("size-4", commentsOpen ? "text-foreground" : "text-muted-foreground")} />
                  {activeThreadCount > 0 && (
                    <Badge size="count" className="pointer-events-none absolute -top-0.5 -right-0.5 bg-warning text-white ring-1 ring-background">
                      {activeThreadCount > 99 ? "99+" : activeThreadCount}
                    </Badge>
                  )}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {activeThreadCount > 0 ? `Komentar (${activeThreadCount} aktif)` : "Komentar"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <NavbarMoreMenu pageId={pageId} title={page.title || "Untitled"} isPublished={page.isPublished ?? false} editor={editor} />

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
