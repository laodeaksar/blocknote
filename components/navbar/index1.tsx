"use client";
import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, convexMutation } from "@convex-dev/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSidebar } from "@/lib/sidebar-context";
import { useEditorContext } from "@/lib/editor-context";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavbarTitle } from "./navbar-title";
import { NavbarStatus } from "./navbar-status";
import { NavbarActions } from "./navbar-actions";

export function Navbar({ pageId, commentsOpen, onToggleComments }: { pageId: Id < "pages" > ;commentsOpen ? : boolean;onToggleComments ? : () => void }) {
  const { toggle, collapsed } = useSidebar();
  const { editor } = useEditorContext();
  const convex = useConvex();
  
  const { data: page, isPending, isError } = useQuery(convexQuery(api.pages.get, { id: pageId }));
  const { data: activeThreadCount = 0 } = useQuery(convexQuery(api.comments.countActiveThreads, { pageId }));
  const { mutateAsync: updatePage, isPending: isUpdatingTitle } = useMutation({
  mutationFn: convexMutation(api.pages.update),
  retry: 2,
  retryDelay: 1000,
  onError: (err) => {
    console.error("Update title error:", err);
    toast.error(err instanceof Error ? err.message : "Gagal update judul");
  },
});
  /*const { mutateAsync: updatePage } = useMutation({
    mutationFn: (vars: any) => convex.utation(api.pages.update, vars),
  });*/
  
  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.getText().trim();
    return text === "" ? 0 : text.split(/\s+/).length;
  }, [editor?.state.doc.content]);
  
  if (isPending || isError) {
    return <nav className="h-12 flex items-center px-4 border-b"><div className="h-4 w-32 bg-muted rounded animate-pulse" /></nav>;
  }
  if (!page) return null;
  
  return (
    <nav className="h-12 flex items-center justify-between px-4 border-b bg-background">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Button variant="ghost" size="icon-sm" onClick={toggle} className="hidden md:inline-flex">
          <PanelLeft className={cn("size-4", collapsed? "text-foreground" : "text-muted-foreground")} />
        </Button>
        {page.icon && <span className="text-sm">{page.icon}</span>}
        <NavbarTitle
          title={page.title}
          onSave={(t) => updatePage({ id: pageId, title: t })}
          isPending={isUpdatingTitle}
        />
      </div>

      <div className="flex items-center gap-2">
        {wordCount > 0 && (
          <span className="hidden md:inline text-xs text-muted-foreground">
            {wordCount.toLocaleString("id")} kata · {Math.max(1, Math.ceil(wordCount / 200))} mnt baca
          </span>
        )}
        <NavbarStatus />
        <NavbarActions
          pageId={pageId}
          isPublished={page.isPublished?? false}
          editor={editor}
          commentsOpen={commentsOpen}
          onToggleComments={onToggleComments}
          activeThreadCount={activeThreadCount}
        />
        <UserMenu />
      </div>
    </nav>
  );
}