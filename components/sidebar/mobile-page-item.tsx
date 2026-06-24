"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FileText, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PageData } from "./types";

export function MobilePageItem({
  page,
  isActive,
  index,
  onNavigate,
  onArchive,
}: {
  page: PageData;
  isActive: boolean;
  index?: number;
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
    <div ref={setNodeRef} style={style}>
    <div
      className={`flex items-center gap-1 px-1 py-1 transition-colors animate-page-item-in ${
        isActive
          ? "bg-muted text-foreground"
          : "text-foreground/70 hover:bg-muted/50"
      }`}
      style={index !== undefined ? { animationDelay: `${index * 50}ms` } : undefined}
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
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 h-7 bg-transparent text-sm border-0 border-b border-primary rounded-none shadow-none px-0 focus-visible:ring-0"
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
        className="hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 />
      </Button>
    </div>
    </div>
  );
}
