"use client";

import { useState } from "react";
import {
  Check,
  FileText,
  Trash2,
  RotateCcw,
  XIcon
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageData } from "./types";

export function TrashSection({
  archivedPages,
  onRestore,
  onRemove,
  onClearAll,
  compact = false,
}: {
  archivedPages: PageData[] | undefined;
  onRestore: (e: React.MouseEvent, id: PageData["_id"]) => void;
  onRemove: (e: React.MouseEvent, id: PageData["_id"], title: string) => void;
  onClearAll?: () => void;
  compact?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  const hasItems = (archivedPages?.length ?? 0) > 0;

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
    onClearAll?.();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
  };

  return (
    <Accordion>
      <AccordionItem value="trash" className="border-0">
        <AccordionTrigger
          className={cn(
            "rounded-md px-2 py-1.5 text-sm hover:bg-accent",
            compact
              ? "h-8 py-1 **:data-[slot=accordion-trigger-icon]:size-3.5"
              : ""
          )}
        >
          <span className="flex items-center gap-2 flex-1 min-w-0">
            <Trash2 className={cn("shrink-0", compact ? "size-3.5" : "size-4")} />
            Trash
            {compact && hasItems && (
              <Badge size="label" variant="secondary">{archivedPages!.length}</Badge>
            )}
          </span>

          {hasItems && onClearAll && (
            confirming ? (
              <span className="flex items-center gap-1 shrink-0 mr-1" onClick={(e) => e.stopPropagation()}>
                <span className="text-xxs text-muted-foreground">Hapus semua?</span>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 px-1.5 text-xxs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleConfirm}
                >
                  <Check />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 px-1.5 text-xxs"
                  onClick={handleCancel}
                >
                  <XIcon />
                </Button>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="xs"
                className="h-5 px-1.5 text-xxs text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 mr-1"
                onClick={handleClearClick}
                title="Hapus semua"
              >
                Hapus semua
              </Button>
            )
          )}
        </AccordionTrigger>

        <AccordionContent className="!pb-0">
          <div className={cn(compact ? "space-y-0.5 pb-1" : "mt-1 space-y-0.5")}>
            {archivedPages?.length === 0 && (
              <p className={cn("text-xs text-muted-foreground", compact ? "px-3 py-1.5" : "px-2 py-1")}>
                Trash is empty
              </p>
            )}
            {archivedPages?.map((page: PageData) => (
              <div
                key={page._id}
                className={cn(
                  "flex items-center rounded-md text-sm text-muted-foreground transition-colors",
                  compact
                    ? "gap-1 px-2 py-1 hover:bg-muted/50"
                    : "justify-between px-2 py-1.5 hover:bg-sidebar-hover"
                )}
              >
                <span className={cn("flex items-center gap-2 min-w-0", compact && "flex-1 px-1")}>
                  <FileText className={cn("shrink-0", compact ? "size-3.5" : "size-4")} />
                  <span className={cn("truncate", compact && "text-xs")}>
                    {page.title || "Untitled"}
                  </span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size={compact ? "icon-sm" : "icon-xs"}
                    onClick={(e) => onRestore(e, page._id)}
                    title="Restore"
                  >
                    <RotateCcw />
                  </Button>
                  <Button
                    variant="ghost"
                    size={compact ? "icon-sm" : "icon-xs"}
                    onClick={(e) => onRemove(e, page._id, page.title)}
                    title="Delete permanently"
                    className="hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
