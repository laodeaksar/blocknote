"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter, useParams } from "next/navigation";
import { Plus, Menu, X, FilePlus, Search } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { useSidebar } from "@/lib/sidebar-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MobilePageItem } from "./mobile-page-item";
import { TrashSection } from "./trash-section";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { SearchModal } from "@/components/search-modal";
import type { PageData } from "./types";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { collapsed: desktopCollapsed } = useSidebar();
  const popoverRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string | undefined;
  const convex = useConvex();

  useEffect(() => {
    if (
      desktopCollapsed === false &&
      typeof window !== "undefined" &&
      window.innerWidth >= 768
    ) {
      setOpen(false);
    }
  }, [desktopCollapsed]);

  const { data: pages, isPending: pagesPending } = useQuery(
    convexQuery(api.pages.list, {})
  );
  const { data: archivedPages } = useQuery(
    convexQuery(api.pages.getArchived, {})
  );
  const { mutateAsync: createPage } = useMutation({
    mutationFn: (vars: { title: string }) =>
      convex.mutation(api.pages.create, vars),
  });
  const { mutateAsync: archivePage } = useMutation({
    mutationFn: (vars: { id: Id<"pages"> }) =>
      convex.mutation(api.pages.archive, vars),
  });
  const { mutateAsync: restorePage } = useMutation({
    mutationFn: (vars: { id: Id<"pages"> }) =>
      convex.mutation(api.pages.restore, vars),
  });
  const { mutateAsync: removePage, isPending: isRemoving } = useMutation({
    mutationFn: (vars: { id: Id<"pages"> }) =>
      convex.mutation(api.pages.remove, vars),
  });
  const { mutateAsync: reorderPages } = useMutation({
    mutationFn: (vars: { orderedIds: Id<"pages">[] }) =>
      convex.mutation(api.pages.reorder, vars),
  });

  const [localPages, setLocalPages] = useState<PageData[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{
    id: Id<"pages">;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (pages) setLocalPages(pages);
  }, [pages]);

  const mobileSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleMobileDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localPages.findIndex((p) => p._id === active.id);
    const newIndex = localPages.findIndex((p) => p._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(localPages, oldIndex, newIndex);
    setLocalPages(reordered);
    await reorderPages({ orderedIds: reordered.map((p) => p._id) });
  };

  const handleCreate = async () => {
    const id = await createPage({ title: "Untitled" });
    router.push(`/doc/${id}`);
    toast.success("New page created");
    setOpen(false);
  };

  const handleArchive = async (e: React.MouseEvent, id: Id<"pages">) => {
    e.stopPropagation();
    await archivePage({ id });
    toast.success("Page moved to trash");
    if (currentId === id) router.push("/dashboard");
  };

  const handleRestore = async (e: React.MouseEvent, id: Id<"pages">) => {
    e.stopPropagation();
    await restorePage({ id });
    toast.success("Page restored");
  };

  const handleRemove = (
    e: React.MouseEvent,
    id: Id<"pages">,
    title: string
  ) => {
    e.stopPropagation();
    setPageToDelete({ id, title });
  };

  const confirmRemove = async () => {
    if (!pageToDelete) return;
    await removePage({ id: pageToDelete.id });
    toast.success("Page permanently deleted");
    setPageToDelete(null);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        barRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <>
      {open && (
        <div
          ref={popoverRef}
          className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-72 rounded-2xl shadow-2xl border border-border overflow-hidden bg-background mobile-popover"
          style={{ animation: "popover-in 0.15s ease" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-foreground rounded flex items-center justify-center shrink-0">
                <span className="text-background text-[10px] font-bold">N</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                Workspace
              </span>
            </div>
            <ThemeToggle />
          </div>

          <ScrollArea className="max-h-56">
            <div className="py-1">
              {(pagesPending || pages === undefined) && (
                <div className="space-y-1.5 px-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-7 w-full" />
                  ))}
                </div>
              )}
              {pages !== undefined && pages.length === 0 && (
                <p className="text-xs text-muted-foreground px-4 py-3">
                  No pages yet.
                </p>
              )}
              <DndContext
                sensors={mobileSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMobileDragEnd}
              >
                <SortableContext
                  items={localPages.map((p) => p._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localPages.map((page: PageData) => (
                    <MobilePageItem
                      key={page._id}
                      page={page}
                      isActive={currentId === page._id}
                      onNavigate={() => {
                        router.push(`/doc/${page._id}`);
                        setOpen(false);
                      }}
                      onArchive={(e) => handleArchive(e, page._id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </ScrollArea>

          <div className="border-t border-border p-1.5 space-y-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreate}
              className="w-full justify-start gap-2"
            >
              <Plus className="w-4 h-4" />
              New Page
            </Button>
            <TrashSection
              archivedPages={archivedPages}
              showTrash={showTrash}
              onToggle={() => setShowTrash((v) => !v)}
              onRestore={handleRestore}
              onRemove={handleRemove}
              compact
            />
          </div>
        </div>
      )}

      <div
        ref={barRef}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center h-12 bg-background border border-border rounded-full shadow-lg px-1 mobile-pill-bar"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          className={`rounded-full ${open ? "bg-muted" : ""}`}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className="rounded-full"
          aria-label="Cari halaman"
        >
          <Search className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreate}
          className="rounded-full"
          aria-label="Halaman baru"
        >
          <FilePlus className="w-4 h-4" />
        </Button>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <ConfirmDeleteDialog
        page={pageToDelete}
        onClose={() => setPageToDelete(null)}
        onConfirm={confirmRemove}
        isPending={isRemoving}
      />
    </>
  );
}
