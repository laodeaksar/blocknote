"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter, useParams } from "next/navigation";
import { Plus, Search, Settings, X } from "lucide-react";
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
import { UserMenu } from "@/components/user-menu";
import { SearchModal } from "@/components/search-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Kbd } from "@/components/ui/kbd";
import { PageItem } from "./page-item";
import { TrashSection } from "./trash-section";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import type { PageData } from "./types";

export function SidebarContent({
  onNavigate,
  onCollapse,
}: {
  onNavigate?: () => void;
  onCollapse?: () => void;
}) {
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string | undefined;
  const convex = useConvex();

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{
    id: Id<"pages">;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (pages) setLocalPages(pages);
  }, [pages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localPages.findIndex((p) => p._id === active.id);
    const newIndex = localPages.findIndex((p) => p._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(localPages, oldIndex, newIndex);
    setLocalPages(reordered);
    await reorderPages({ orderedIds: reordered.map((p) => p._id) });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleCreate = async () => {
    const id = await createPage({ title: "Untitled" });
    router.push(`/doc/${id}`);
    toast.success("New page created");
    onNavigate?.();
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

  const navigate = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center shrink-0">
            <span className="text-background text-xs font-bold">N</span>
          </div>
          <span className="text-sm font-medium text-foreground">Workspace</span>
        </div>
        <div className="flex items-center gap-1">
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onCollapse}
              title="Collapse sidebar"
              className="h-6 w-6 text-muted-foreground"
            >
              <X className="size-3.5" />
            </Button>
          )}
          <UserMenu />
        </div>
      </div>

      <div className="px-2 space-y-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search</span>
          <Kbd className="hidden sm:inline-flex">
            <span>⌘</span>
            <span>K</span>
          </Kbd>
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-muted-foreground"
          >
            <Settings className="size-4" />
            Settings
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-4 px-2">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Pages
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCreate}
            title="New page"
            className="h-5 w-5"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <ScrollArea className="h-full">
          {(pagesPending || pages === undefined) && (
            <div className="space-y-1 px-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          )}

          {pages !== undefined && pages.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-2">
              No pages yet. Create one!
            </p>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localPages.map((p) => p._id)}
              strategy={verticalListSortingStrategy}
            >
              {localPages.map((page: PageData) => (
                <PageItem
                  key={page._id}
                  page={page}
                  isActive={currentId === page._id}
                  onNavigate={() => navigate(`/doc/${page._id}`)}
                  onArchive={(e) => handleArchive(e, page._id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </div>

      <div className="px-2 pb-2 mt-2">
        <Separator className="mb-2" />
        <TrashSection
          archivedPages={archivedPages}
          onRestore={handleRestore}
          onRemove={handleRemove}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreate}
          className="w-full justify-start gap-2 text-muted-foreground mt-1"
        >
          <Plus className="size-4" />
          New page
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
