"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  FileText,
  Trash2,
  RotateCcw,
  ChevronDown,
  Search,
  Settings,
  Menu,
  X,
  FilePlus,
  GripVertical,
} from "lucide-react";
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
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { UserMenu } from "@/components/user-menu";
import { SearchModal } from "@/components/search-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type PageData = {
  _id: Id<"pages">;
  title: string;
  icon?: string;
  isArchived: boolean;
  isPublished: boolean;
};

function PageItem({
  page,
  isActive,
  onNavigate,
  onArchive,
}: {
  page: { _id: Id<"pages">; title: string; icon?: string };
  isActive: boolean;
  onNavigate: () => void;
  onArchive: (e: React.MouseEvent) => void;
}) {
  const convex = useConvex();
  const { mutateAsync: updatePage } = useMutation({
    mutationFn: (vars: { id: Id<"pages">; title: string }) =>
      convex.mutation(api.pages.update, vars),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(page.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    setEditValue(page.title || "Untitled");
    setIsEditing(true);
  };

  const commitEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditValue(page.title || "Untitled");
      setIsEditing(false);
      return;
    }
    if (trimmed !== page.title) {
      await updatePage({ id: page._id, title: trimmed });
      toast.success("Page renamed");
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      setEditValue(page.title || "Untitled");
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={!isEditing ? onNavigate : undefined}
      className={`group relative w-full flex items-center justify-between px-1 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
        isActive
          ? "bg-sidebar-hover text-foreground"
          : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded"
        title="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <span className="flex items-center gap-2 min-w-0 flex-1 pl-0.5">
        {page.icon ? (
          <span className="text-sm shrink-0">{page.icon}</span>
        ) : (
          <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
        )}

        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="h-6 flex-1 min-w-0 py-0 px-1 text-sm"
          />
        ) : (
          <span
            className="truncate flex-1"
            onDoubleClick={startEditing}
            title={isActive ? "Double-click to rename" : undefined}
          >
            {page.title || "Untitled"}
          </span>
        )}
      </span>

      {!isEditing && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => { e.stopPropagation(); onArchive(e); }}
          className="opacity-0 group-hover:opacity-100 shrink-0 h-5 w-5"
          title="Move to trash"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

function MobilePageItem({
  page,
  isActive,
  onNavigate,
  onArchive,
}: {
  page: PageData;
  isActive: boolean;
  onNavigate: () => void;
  onArchive: (e: React.MouseEvent) => void;
}) {
  const convex = useConvex();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(page.title || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: updatePage } = useMutation({
    mutationFn: (vars: { id: Id<"pages">; title: string }) =>
      convex.mutation(api.pages.update, vars),
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(page.title || "");
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const commitEdit = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== page.title) {
      await updatePage({ id: page._id, title: trimmed });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 px-1 py-1 transition-colors ${
        isActive
          ? "bg-muted text-foreground"
          : "text-foreground/70 hover:bg-muted/50"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 p-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none"
        tabIndex={-1}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1 min-w-0 px-1 py-1">
          {page.icon ? (
            <span className="text-sm shrink-0">{page.icon}</span>
          ) : (
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none border-b border-primary"
            placeholder="Untitled"
          />
        </div>
      ) : (
        <button
          onClick={onNavigate}
          onDoubleClick={startEdit}
          className="flex items-center gap-2 flex-1 min-w-0 px-1 py-1 text-sm text-left"
        >
          {page.icon ? (
            <span className="text-sm shrink-0">{page.icon}</span>
          ) : (
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate">{page.title || "Untitled"}</span>
        </button>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onArchive}
        title="Move to trash"
        className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function ConfirmDeleteDialog({
  page,
  onClose,
  onConfirm,
  isPending,
}: {
  page: { id: Id<"pages">; title: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={!!page} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus permanen?</DialogTitle>
          <DialogDescription>
            <strong>&ldquo;{page?.title || "Untitled"}&rdquo;</strong> akan
            dihapus selamanya dan tidak bisa dikembalikan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
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
  const [showTrash, setShowTrash] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: Id<"pages">; title: string } | null>(null);

  useEffect(() => {
    if (pages) setLocalPages(pages);
  }, [pages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
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

  const handleRemove = (e: React.MouseEvent, id: Id<"pages">, title: string) => {
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
        <UserMenu />
      </div>

      <div className="px-2 space-y-0.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground/60">
            <span>⌘</span><span>K</span>
          </kbd>
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-muted-foreground"
          >
            <Settings className="w-4 h-4" />
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
            <Plus className="w-4 h-4" />
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

        <button
          onClick={() => setShowTrash((v) => !v)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-hover hover:text-foreground rounded-md transition-colors"
        >
          <span className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Trash
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showTrash ? "rotate-180" : ""}`}
          />
        </button>

        {showTrash && (
          <div className="mt-1 space-y-0.5">
            {archivedPages?.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-1">
                Trash is empty
              </p>
            )}
            {archivedPages?.map((page: PageData) => (
              <div
                key={page._id}
                className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-hover transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{page.title || "Untitled"}</span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => handleRestore(e, page._id)}
                    title="Restore"
                    className="h-6 w-6"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => handleRemove(e, page._id, page.title)}
                    title="Delete permanently"
                    className="h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreate}
          className="w-full justify-start gap-2 text-muted-foreground mt-1"
        >
          <Plus className="w-4 h-4" />
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

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 h-full bg-sidebar border-r border-border shrink-0">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const currentId = params?.id as string | undefined;
  const convex = useConvex();

  const { data: pages, isPending: pagesPending } = useQuery(convexQuery(api.pages.list, {}));
  const { data: archivedPages } = useQuery(convexQuery(api.pages.getArchived, {}));
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
  const [pageToDelete, setPageToDelete] = useState<{ id: Id<"pages">; title: string } | null>(null);

  useEffect(() => {
    if (pages) setLocalPages(pages);
  }, [pages]);

  const mobileSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
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

  const handleRemove = (e: React.MouseEvent, id: Id<"pages">, title: string) => {
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

            <button
              onClick={() => setShowTrash((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Trash
                {(archivedPages?.length ?? 0) > 0 && (
                  <span className="text-[10px] bg-muted rounded-full px-1.5 py-0.5 font-medium">
                    {archivedPages!.length}
                  </span>
                )}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showTrash ? "rotate-180" : ""}`}
              />
            </button>

            {showTrash && (
              <div className="space-y-0.5 pb-1">
                {archivedPages?.length === 0 && (
                  <p className="text-xs text-muted-foreground px-3 py-1.5">
                    Trash is empty
                  </p>
                )}
                {archivedPages?.map((page: PageData) => (
                  <div
                    key={page._id}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-2 flex-1 min-w-0 px-1">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate text-xs">{page.title || "Untitled"}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => handleRestore(e, page._id)}
                      title="Restore"
                      className="shrink-0 h-7 w-7"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => handleRemove(e, page._id, page.title)}
                      title="Delete permanently"
                      className="shrink-0 h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
          onClick={handleCreate}
          className="rounded-full"
          aria-label="New page"
        >
          <FilePlus className="w-4 h-4" />
        </Button>
      </div>

      <ConfirmDeleteDialog
        page={pageToDelete}
        onClose={() => setPageToDelete(null)}
        onConfirm={confirmRemove}
        isPending={isRemoving}
      />
    </>
  );
}
