"use client";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FileText } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import{ Badge } from "@/components/ui/badge";

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
      <CommandInput placeholder="Cari halaman..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>
        <CommandGroup heading="Halaman">
          {(pages ?? []).map((page: Page) => (
            <CommandItem
              key={page._id}
              value={page.title || "Untitled"}
              onSelect={() => navigate(page._id)}
              className="gap-3"
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
                <Badge className="ml-auto text-success bg-success-foreground">
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
