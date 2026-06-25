"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { debounce } from "@tanstack/pacer";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvex, useConvexConnectionState } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MoreHorizontal, Share2, Check, Loader2, Pencil, PanelLeft, MessageSquare, FileDown, FileCode, FileText } from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/lib/sidebar-context";
import { useEditorContext } from "@/lib/editor-context";
import { UserMenu } from "@/components/user-menu";
import { PublishPopover } from "@/components/publish-popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { editor } = useEditorContext();
  const convex = useConvex();
  const { data: page, isPending, isError } = useQuery(convexQuery(api.pages.get, { id: pageId }));
  const { data: activeThreadCount = 0 } = useQuery(convexQuery(api.comments.countActiveThreads, { pageId }));
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
  const [wordCount, setWordCount] = useState(0);
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

  const debouncedWordCount = useMemo(
    () =>
      debounce((text: string) => {
        const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        setWordCount(words);
      }, { wait: 300, leading: false, trailing: true }),
    []
  );

  useEffect(() => {
    if (!editor) return;
    const update = () => debouncedWordCount(editor.getText());
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
      debouncedWordCount.cancel?.();
    };
  }, [editor, debouncedWordCount]);

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

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    if (!editor) return;
    const title = page?.title || "Untitled";
    const body = editor.getHTML();
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #111; }
    h1,h2,h3,h4,h5,h6 { line-height: 1.25; margin: 1.5em 0 0.5em; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    code { font-family: monospace; font-size: 0.9em; background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #ccc; margin: 0; padding-left: 1rem; color: #666; }
    img { max-width: 100%; height: auto; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    downloadFile(html, `${slug || "untitled"}.html`, "text/html;charset=utf-8");
    toast.success("Diekspor sebagai HTML");
  };

  const exportMarkdown = async () => {
    if (!editor) return;
    const title = page?.title || "Untitled";
    const { default: TurndownService } = await import("turndown");
    const td = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });
    td.addRule("taskList", {
      filter: (node) =>
        node.nodeName === "LI" &&
        node.querySelector('input[type="checkbox"]') !== null,
      replacement: (_content, node) => {
        const checkbox = (node as Element).querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        const checked = checkbox?.checked ? "x" : " ";
        const text = (node.textContent ?? "").replace(/^\s*\n/, "").trimEnd();
        return `- [${checked}] ${text}\n`;
      },
    });
    const html = editor.getHTML();
    const md = `# ${title}\n\n${td.turndown(html)}`;
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    downloadFile(md, `${slug || "untitled"}.md`, "text/markdown;charset=utf-8");
    toast.success("Diekspor sebagai Markdown");
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
              <PanelLeft className={cn("size-4 transition-colors", collapsed ? "text-foreground" : "text-muted-foreground")} />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Toggle sidebar <Kbd data-icon="inline-end">[</Kbd>
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
            <Pencil className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 shrink-0 transition-opacity" />
          </button>
        )}
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
                <TooltipTrigger render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Toggle comments"
                    onClick={onToggleComments}
                    className={cn("relative", commentsOpen ? "bg-accent text-foreground" : "")}
                  />
                }>
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

          {/* More options — Share + Export dalam satu dropdown */}
          <div className="relative">
            {/* Invisible anchor untuk PublishPopover */}
            <Popover open={showPublish} onOpenChange={setShowPublish}>
              <PopoverTrigger
                render={<span className="absolute inset-0 pointer-events-none" />}
              />
              <PopoverContent align="end" className="w-auto p-0">
                <PublishPopover
                  pageId={pageId}
                  isPublished={page.isPublished ?? false}
                  onClose={() => setShowPublish(false)}
                />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon-sm" aria-label="More options" />
              }>
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Halaman ini
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowPublish(true)}
                  className="gap-2 text-sm cursor-pointer"
                >
                  <Share2 className={cn("size-4", page.isPublished ? "text-success" : "text-muted-foreground")} />
                  {page.isPublished ? "Kelola publikasi" : "Publikasikan ke web"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Export
                </DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={!editor}
                  onClick={exportHTML}
                  className="gap-2 text-sm cursor-pointer"
                >
                  <FileCode className="size-4 text-muted-foreground" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!editor}
                  onClick={exportMarkdown}
                  className="gap-2 text-sm cursor-pointer"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  Export as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
