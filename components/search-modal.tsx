"use client";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { Search, FileText, X } from "lucide-react";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

type Page = {
  _id: Id<"pages">;
  title: string;
  icon?: string;
  isArchived: boolean;
  isPublished: boolean;
};

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const { data: pages, isPending } = useQuery(convexQuery(api.pages.list, {}));
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim() === ""
      ? (pages ?? [])
      : (pages ?? []).filter((p: Page) =>
          p.title.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  const navigate = useCallback(
    (id: Id<"pages">) => {
      router.push(`/doc/${id}`);
      onClose();
    },
    [router, onClose]
  );

  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter" && filtered[cursor]) {
        navigate(filtered[cursor]._id);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filtered, cursor, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg mx-4 bg-popover rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari halaman..."
            className="flex-1 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
          />
          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-0.5 rounded hover:bg-accent transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border text-[10px] text-muted-foreground font-mono">
              ESC
            </kbd>
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto py-1.5"
        >
          {isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          )}

          {!isPending && filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {query ? `Tidak ada hasil untuk "${query}"` : "Belum ada halaman"}
            </div>
          )}

          {filtered.map((page: Page, i: number) => (
            <button
              key={page._id}
              onClick={() => navigate(page._id)}
              onMouseEnter={() => setCursor(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === cursor ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              {page.icon ? (
                <span className="text-base shrink-0">{page.icon}</span>
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm text-foreground truncate">
                {page.title || "Untitled"}
              </span>
              {page.isPublished && (
                <span className="ml-auto shrink-0 text-[10px] text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                  publik
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="border border-border rounded px-1 font-mono">↑↓</kbd>
              navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border border-border rounded px-1 font-mono">↵</kbd>
              buka
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border border-border rounded px-1 font-mono">ESC</kbd>
              tutup
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
