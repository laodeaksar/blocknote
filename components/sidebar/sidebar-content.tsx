"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { RateLimiter, AsyncThrottler } from "@tanstack/pacer";
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
import { UserMenu } from "@/components/user-menu";
import { SearchModal } from "@/components/search-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
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

  const [localPages, setLocalPages] = useState<PageData[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{
    id: Id<"pages">;
    title: string;
  } | null>(null);

  const makeLimiter = (limit: number, window: number) =>
    new RateLimiter(() => {}, { limit, window });

  const createLimiter   = useRef(makeLimiter(5,  60_000)).current;
  const archiveLimiter  = useRef(makeLimiter(10, 30_000)).current;
  const restoreLimiter  = useRef(makeLimiter(10, 30_000)).current;
  const deleteLimiter   = useRef(makeLimiter(5,  30_000)).current;
  const clearAllLimiter = useRef(makeLimiter(2,  60_000)).current;

  const reorderPagesRef = useRef(reorderPages);
  reorderPagesRef.current = reorderPages;

  const reorderThrottler = useRef(
    new AsyncThrottler(
      async (orderedIds: Id<"pages">[]) => {
        await reorderPagesRef.current({ orderedIds });
      },
      { wait: 500, leading: true, trailing: true }
    )
  ).current;

  const checkRate = (limiter: RateLimiter<() => void>, windowMs: number): boolean => {
    const prev = limiter.store.state.rejectionCount;
    limiter.maybeExecute();
    if (limiter.store.state.rejectionCount > prev) {
      const times = limiter.store.state.executionTimes;
      const oldest = times.length > 0 ? times[0] : Date.now();
      const retryIn = Math.max(1, Math.ceil((oldest + windowMs - Date.now()) / 1000));
      toast.error(`Terlalu cepat. Coba lagi dalam ${retryIn} detik.`);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (pages) setLocalPages(pages);
  }, [pages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localPages.findIndex((p) => p._id === active.id);
    const newIndex = localPages.findIndex((p) => p._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(localPages, oldIndex, newIndex);
    setLocalPages(reordered);
    reorderThrottler.maybeExecute(reordered.map((p) => p._id));
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
    if (!checkRate(createLimiter, 60_000)) return;
    const id = await createPage({ title: "Untitled" });
    router.push(`/doc/${id}`);
    toast.success("New page created");
    onNavigate?.();
  };

  const handleArchive = async (e: React.MouseEvent, id: Id<"pages">) => {
    e.stopPropagation();
    if (!checkRate(archiveLimiter, 30_000)) return;
    await archivePage({ id });
    toast.success("Page moved to trash");
    if (currentId === id) router.push("/dashboard");
  };

  const handleRestore = async (e: React.MouseEvent, id: Id<"pages">) => {
    e.stopPropagation();
    if (!checkRate(restoreLimiter, 30_000)) return;
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
    if (!checkRate(deleteLimiter, 30_000)) return;
    await removePage({ id: pageToDelete.id });
    toast.success("Page permanently deleted");
    setPageToDelete(null);
  };

  const handleClearAll = async () => {
    if (!checkRate(clearAllLimiter, 60_000)) return;
    const count = await clearTrashPages({});
    toast.success(`${count} halaman dihapus permanen`);
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
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onCollapse}
              title="Collapse sidebar"
            >
              <X />
            </Button>
          )}
          <UserMenu />
        </div>
      </div>

      <div className="px-2 space-y-0.5">
        <Button
          type="button"
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
            type="button"
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
          <LoadingButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleCreate}
            title="New page"
            className="h-5 w-5"
            isPending={isCreating}
          >
            <Plus className="size-4" />
          </LoadingButton>
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
              {localPages.map((page: PageData, index) => (
                <PageItem
                  key={page._id}
                  page={page}
                  isActive={currentId === page._id}
                  index={index}
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
          onClearAll={handleClearAll}
        />
        <LoadingButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCreate}
          className="w-full justify-start gap-2 text-muted-foreground mt-1"
          isPending={isCreating}
          loadingText="Membuat…"
        >
          <Plus data-icon="inline-start" />
          Halaman
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
