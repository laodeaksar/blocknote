"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FileText, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PageItem({
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
          onClick={(e) => {
            e.stopPropagation();
            onArchive(e);
          }}
          className="opacity-0 group-hover:opacity-100 shrink-0 h-5 w-5"
          title="Move to trash"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
