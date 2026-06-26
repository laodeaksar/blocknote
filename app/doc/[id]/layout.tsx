"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { CommentsPanel } from "@/components/comments-panel";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/lib/sidebar-context";
import { EditorProvider, useEditorContext } from "@/lib/editor-context";
import type { Id } from "@/convex/_generated/dataModel";

function DocInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pageId = params.id as Id<"pages">;

  const {
    commentsOpen,
    activeThreadId,
    toggleComments,
    closeComments,
    setActiveThreadId,
  } = useEditorContext();

  const { data: activeThreadCount = 0 } = useQuery(
    convexQuery(api.comments.countActiveThreads, { pageId })
  );

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
            {children}
          </div>
        </div>
        <CommentsPanel
          pageId={pageId}
          open={commentsOpen}
          onOpenChange={(open) => {
            if (!open) closeComments();
          }}
          activeThreadId={activeThreadId}
          onActiveThreadChange={setActiveThreadId}
        />
      </div>
    </div>
  );
}

export default function DocLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <MobileSidebar />
        <EditorProvider>
          <DocInner>{children}</DocInner>
        </EditorProvider>
      </div>
    </SidebarProvider>
  );
}
