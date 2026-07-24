"use client";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import { Debouncer } from "@tanstack/pacer";
import { FileText } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

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
  const { data: pages } = useQuery(convexQuery(api.pages.list, {}));

  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debouncedSet = useMemo(
    () => new Debouncer((val: string) => setDebouncedQuery(val), { wait: 200, leading: false, trailing: true }),
    []
  );

  const debouncedSetRef = useRef(debouncedSet);
  debouncedSetRef.current = debouncedSet;

  useEffect(() => {
    debouncedSetRef.current.maybeExecute(inputValue);
  }, [inputValue]);

  useEffect(() => {
    if (!open) {
      setInputValue("");
      setDebouncedQuery("");
      debouncedSetRef.current.cancel();
    }
  }, [open]);

  const filteredPages = useMemo(() => {
    const all = pages ?? [];
    if (!debouncedQuery.trim()) return all;
    const q = debouncedQuery.toLowerCase();
    return all.filter((p: Page) => (p.title || "Untitled").toLowerCase().includes(q));
  }, [pages, debouncedQuery]);

  const navigate = useCallback(
    (id: Id<"pages">) => {
      router.push(`/doc/${id}`);
      onClose();
    },
    [router, onClose]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="Cari halaman"
      description="Ketik untuk mencari halaman"
    >
      <CommandInput
        placeholder="Cari halaman..."
        clearable
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>
        <CommandGroup heading="Halaman">
          {filteredPages.map((page: Page) => (
            <CommandItem
              key={page._id}
              value={page._id}
              onSelect={() => navigate(page._id)}
              className="gap-3 data-selected:bg-transparent data-selected:text-foreground"
            >
              {page.icon ? (
                <span className="text-base shrink-0">{page.icon}</span>
              ) : (
                <FileText className="shrink-0 text-muted-foreground" />
              )}
              <span className="truncate flex-1">
                {page.title || "Untitled"}
              </span>
              {page.isPublished && (
                <Badge size="label" className="ml-auto text-success bg-success-foreground">
                  publik
                </Badge>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
