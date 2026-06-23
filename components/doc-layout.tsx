"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { CommentsPanel } from "@/components/comments-panel";
import { EditorWrapper } from "@/components/editor-wrapper";
import type { Id } from "@/convex/_generated/dataModel";
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
          <div className="max-w-4xl mx-auto p-7 md:p-15">
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
    </div>
  );
}
