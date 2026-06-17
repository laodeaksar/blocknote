"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { CommentsPanel } from "@/components/comments-panel";
import { EditorWrapper } from "@/components/editor-wrapper";
import type { Id } from "@/convex/_generated/dataModel";

interface DocLayoutProps {
  pageId: Id<"pages">;
}

export function DocLayout({ pageId }: DocLayoutProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Navbar
        pageId={pageId}
        commentsOpen={commentsOpen}
        onToggleComments={() => setCommentsOpen((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-4xl mx-auto py-8 px-4 md:py-16">
            <EditorWrapper pageId={pageId} />
          </div>
        </div>
        <CommentsPanel
          pageId={pageId}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
        />
      </div>
    </div>
  );
}
