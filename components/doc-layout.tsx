"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { CommentsPanel } from "@/components/comments-panel";
import { EditorWrapper } from "@/components/editor-wrapper";
import type { Id } from "@/convex/_generated/dataModel";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocLayoutProps {
  pageId: Id<"pages">;
}

export function DocLayout({ pageId }: DocLayoutProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();

  const { data: activeThreadCount = 0 } = useQuery(
    convexQuery(api.comments.countActiveThreads, { pageId })
  );

  const handleCommentsOpen = useCallback((threadId?: string) => {
    setCommentsOpen(true);
    if (threadId) setActiveThreadId(threadId);
  }, []);

  const handlePanelOpenChange = useCallback((open: boolean) => {
    setCommentsOpen(open);
    if (!open) setActiveThreadId(undefined);
  }, []);

  const toggleComments = useCallback(() => setCommentsOpen((v) => !v), []);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Navbar
        pageId={pageId}
        commentsOpen={commentsOpen}
        onToggleComments={toggleComments}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-4xl mx-auto py-8 pl-10 pr-4 md:py-16 md:pl-20 md:pr-10">
            <EditorWrapper
              pageId={pageId}
              onCommentsOpen={handleCommentsOpen}
            />
          </div>
        </div>
        <CommentsPanel
          pageId={pageId}
          open={commentsOpen}
          onOpenChange={handlePanelOpenChange}
          activeThreadId={activeThreadId}
          onActiveThreadChange={setActiveThreadId}
        />
      </div>

      {/* Mobile FAB — only visible on small screens */}
      <button
        type="button"
        aria-label="Buka komentar"
        onClick={toggleComments}
        className={cn(
          "md:hidden fixed bottom-6 right-5 z-40",
          "flex items-center justify-center",
          "h-14 w-14 rounded-full shadow-lg",
          "bg-primary text-primary-foreground",
          "transition-transform active:scale-95",
          commentsOpen && "opacity-0 pointer-events-none"
        )}
      >
        <MessageSquare className="w-6 h-6" />
        {activeThreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
            {activeThreadCount > 99 ? "99+" : activeThreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
