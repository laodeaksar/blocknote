"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NavbarTitleProps {
  title: string;
  onCommit: (newTitle: string) => void | Promise<void>;
}

export function NavbarTitle({ title, onCommit }: NavbarTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraft(title || "");
    setIsEditing(true);
  };

  const commit = async () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) {
      await onCommit(trimmed);
    }
    setIsEditing(false);
  };

  const cancel = () => setIsEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="h-7 text-sm font-medium border-0 border-b border-border rounded-none shadow-none bg-transparent px-1 focus-visible:ring-0 focus-visible:border-primary min-w-0 flex-1"
        placeholder="Untitled"
        maxLength={100}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="group flex items-center gap-1.5 min-w-0 text-left"
      title="Tap to rename"
    >
      <span className="text-sm font-medium text-foreground truncate">
        {title || "Untitled"}
      </span>
      <Pencil className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 shrink-0 transition-opacity" />
    </button>
  );
}
