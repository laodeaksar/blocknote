"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import { cn } from "@/lib/utils";
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
  const [mounted, setMounted] = useState(false);
  const { collapsed: desktopCollapsed } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string | undefined;
  const convex = useConvex();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      desktopCollapsed === false &&
      typeof window !== "undefined" &&
      window.innerWidth >= 768
    ) {
      setOpen(false);
    }
  }, [desktopCollapsed]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
  const { mutateAsync: clearTrashPages } = useMutation({
    mutationFn: () => convex.mutation(api.pages.clearTrash, {}),
  });
  const { mutateAsync: reorderPages } = useMutation({
    mutationFn: (vars: { orderedIds: Id<"pages">[] }) =>
      convex.mutation(api.pages.reorder, vars),
  });

  const dragStartY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const didVibrate = useRef(false);

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleDragStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragging.current = true;
    didVibrate.current = false;
  };
  const handleDragMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    const offset = Math.max(0, dy);
    if (offset > 80 && !didVibrate.current) {
      vibrate(15);
      didVibrate.current = true;
    }
    setDragOffset(offset);
  };
  const handleDragEnd = () => {
    dragging.current = false;
    if (dragOffset > 80) setOpen(false);
    setDragOffset(0);
  };

  const [localPages, setLocalPages] = useState<PageData[]>([]);
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
    try {
      const id = await createPage({ title: "Untitled" });
      router.push(`/doc/${id}`);
      toast.success("New page created");
      setOpen(false);
    } catch {
      toast.error("Gagal membuat halaman");
    }
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

  const handleClearAll = async () => {
    const count = await clearTrashPages();
    toast.success(`${count} halaman dihapus permanen`);
  };

  const toggleOpen = () => {
    vibrate(10);
    setOpen((v) => !v);
  };

  const openSearch = () => {
    vibrate(10);
    setOpen(false);
    setSearchOpen(true);
  };

  const addPage = () => {
    vibrate(10);
    handleCreate();
  };

  if (!mounted) return null;

  const portal = createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[9998] bg-black/40",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{
          backdropFilter: open ? "blur(4px)" : "blur(0px)",
          transition: open
            ? "opacity 350ms ease-out, backdrop-filter 350ms ease-out"
            : "opacity 220ms ease-in, backdrop-filter 220ms ease-in",
        }}
        onClick={() => setOpen(false)}
      />

      {/* Floating sheet */}
      <div
        className="md:hidden fixed inset-x-3 bottom-22 z-[9999] flex flex-col bg-background rounded-2xl shadow-2xl border border-border/60 max-h-[calc(100dvh-104px)]"
        style={
          dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)`, pointerEvents: "auto" }
            : {
                transform: open ? "translateY(0px)" : "translateY(calc(100% + 96px))",
                transition: open
                  ? "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : "transform 280ms cubic-bezier(0.36, 0, 0.66, 0)",
                pointerEvents: open ? "auto" : "none",
                visibility: open ? "visible" : "hidden",
              }
        }
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1 shrink-0 touch-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-foreground rounded flex items-center justify-center shrink-0">
              <span className="text-background text-xxs font-bold">N</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              Workspace
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </div>

        {/* Page list */}
        <ScrollArea className="flex-1 min-h-0">
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
                {localPages.map((page: PageData, index) => (
                  <MobilePageItem
                    key={page._id}
                    page={page}
                    isActive={currentId === page._id}
                    index={index}
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

        {/* Footer actions */}
        <div className="shrink-0 border-t border-border p-1.5 space-y-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreate}
            className="w-full justify-start gap-2"
          >
            <Plus data-icon="inline-start" />
            New Page
          </Button>
          <TrashSection
            archivedPages={archivedPages}
            onRestore={handleRestore}
            onRemove={handleRemove}
            onClearAll={handleClearAll}
            compact
          />
        </div>
      </div>

      {/* Pill bar */}
      <div
        className="md:hidden fixed bottom-6 left-1/2 z-[10000] flex items-center h-12 bg-background border border-border rounded-full shadow-lg px-1 mobile-pill-bar"
        style={{
          transform: `translateX(-50%) scale(${open ? 0.92 : 1})`,
          transition: open
            ? "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "transform 260ms cubic-bezier(0.36, 0, 0.66, 0)",
        }}
      >
        <button
          type="button"
          onPointerDown={toggleOpen}
          className={cn(
            "inline-flex items-center justify-center size-9 rounded-full transition-colors",
            "hover:bg-muted active:bg-muted/80",
            open && "bg-muted"
          )}
          aria-label="Toggle menu"
        >
          {open
            ? <X className="size-4 animate-icon-spring-in" />
            : <Menu className="size-4 animate-icon-spring-in" />
          }
        </button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <button
          type="button"
          onPointerDown={openSearch}
          className="inline-flex items-center justify-center size-9 rounded-full transition-colors hover:bg-muted active:bg-muted/80"
          aria-label="Cari halaman"
        >
          <Search className="size-4" />
        </button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <button
          type="button"
          onPointerDown={addPage}
          className="inline-flex items-center justify-center size-9 rounded-full transition-colors hover:bg-muted active:bg-muted/80"
          aria-label="Halaman baru"
        >
          <FilePlus className="size-4" />
        </button>
      </div>
    </>,
    document.body
  );

  return (
    <>
      {portal}
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
