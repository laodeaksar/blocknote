"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvex, useConvexConnectionState } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MoreHorizontal, Star, Share2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserMenu } from "@/components/user-menu";
import { PublishPopover } from "@/components/publish-popover";

interface NavbarProps {
  pageId: Id<"pages">;
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

export function Navbar({ pageId }: NavbarProps) {
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

  const [showPublish, setShowPublish] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(e.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node)
    ) {
      setShowPublish(false);
    }
  }, []);

  useEffect(() => {
    if (showPublish) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPublish, handleClickOutside]);

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
      <div className="flex items-center gap-2 min-w-0">
        {page.icon && <span className="text-sm">{page.icon}</span>}
        <span className="text-sm font-medium text-foreground truncate">
          {page.title || "Untitled"}
        </span>
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
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowPublish((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                page.isPublished
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                  : "border-border hover:bg-accent text-foreground"
              }`}
            >
              <Share2 className="w-3 h-3" />
              {page.isPublished ? "Published" : "Share"}
            </button>

            {showPublish && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full mt-2 z-50 bg-popover rounded-xl border border-border shadow-xl"
              >
                <PublishPopover
                  pageId={pageId}
                  isPublished={page.isPublished ?? false}
                  onClose={() => setShowPublish(false)}
                />
              </div>
            )}
          </div>

          <button className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <Star className="w-4 h-4 text-muted-foreground" />
          </button>

          <button className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
