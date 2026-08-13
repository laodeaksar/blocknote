"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
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
import { useSidebar as useUiSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
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
  const { state: desktopState } = useUiSidebar();
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string | undefined;

  useEffect(() => {
    if (
      desktopState === "expanded" &&
      typeof window !== "undefined" &&
      window.innerWidth >= 768
    ) {
      setOpen(false);
    }
  }, [desktopState]);

  // Lock body scroll when sheet is open
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
  const { mutateAsync: createPage, isPending: isCreating } = useMutation({
    mutationFn: useConvexMutation(api.pages.create),
  });
  const { mutateAsync: archivePage } = useMutation({
    mutationFn: useConvexMutation(api.pages.archive),
  });
  const { mutateAsync: restorePage } = useMutation({
    mutationFn: useConvexMutation(api.pages.restore),
  });
  const { mutateAsync: removePage, isPending: isRemoving } = useMutation({
    mutationFn: useConvexMutation(api.pages.remove),
  });
  const { mutateAsync: clearTrashPages } = useMutation({
    mutationFn: useConvexMutation(api.pages.clearTrash),
  });
  const { mutateAsync: reorderPages } = useMutation({
    mutationFn: useConvexMutation(api.pages.reorder),
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

  const handleClearAll = async () => {
    const count = await clearTrashPages({});
    toast.success(`${count} halaman dihapus permanen`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/40",
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
        className={cn(
          "md:hidden fixed inset-x-3 bottom-22 z-50 flex flex-col",
          "bg-background rounded-2xl shadow-2xl border border-border/60",
          "max-h-[calc(100dvh-104px)]",
          open ? "translate-y-0" : "translate-y-[calc(100%+96px)]"
        )}
        style={
          dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)` }
            : {
                transition: open
                  ? "transform 420ms var(--ease-spring)"
                  : "transform 280ms var(--ease-snap)",
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
            {/*<Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
            >
              <X />
            </Button>*/}
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
          <LoadingButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCreate}
            className="w-full justify-start gap-2"
            isPending={isCreating}
            loadingText="Membuat halaman…"
          >
            <Plus data-icon="inline-start" />
            New Page
          </LoadingButton>
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
        className="md:hidden fixed bottom-6 left-1/2 z-40 flex items-center h-12 bg-background border border-border rounded-full shadow-lg px-1 mobile-pill-bar"
        style={{
          transform: `translateX(-50%) scale(${open ? 0.92 : 1})`,
          transition: open
            ? "transform 320ms var(--ease-spring)"
            : "transform 260ms var(--ease-snap)",
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { vibrate(10); setOpen((v) => !v); }}
          className={cn("rounded-full overflow-hidden", open && "bg-muted")}
          aria-label="Toggle menu"
        >
          {open
            ? <X key="x" className="animate-icon-spring-in" />
            : <Menu key="menu" className="animate-icon-spring-in" />
          }
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { vibrate(10); setOpen(false); setSearchOpen(true); }}
          className="rounded-full"
          aria-label="Cari halaman"
        >
          <Search />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <LoadingButton
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { vibrate(10); handleCreate(); }}
          className="rounded-full"
          aria-label="Halaman baru"
          isPending={isCreating}
        >
          <FilePlus />
        </LoadingButton>
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
