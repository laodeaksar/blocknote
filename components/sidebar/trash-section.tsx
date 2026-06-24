"use client";

import { FileText, Trash2, RotateCcw, ChevronDown } from "lucide-react";
import { Accordion, AccordionItem, AccordionContent } from "@/components/ui/accordion";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageData } from "./types";

export function TrashSection({
  archivedPages,
  onRestore,
  onRemove,
  compact = false,
}: {
  archivedPages: PageData[] | undefined;
  onRestore: (e: React.MouseEvent, id: PageData["_id"]) => void;
  onRemove: (e: React.MouseEvent, id: PageData["_id"], title: string) => void;
  compact?: boolean;
}) {
  return (
    <Accordion>
      <AccordionItem value="trash" className="border-0">
        <AccordionPrimitive.Header className="flex">
          <AccordionPrimitive.Trigger
            className={cn(
              "rounded-md px-2 py-1.5 hover:bg-accent outline-none",
              compact ? "h-8 py-1 **:data-[slot=accordion-trigger-icon]:size-3.5" : "**:data-[slot=accordion-trigger-icon]:size-4"
            )}
          >
            <span className="flex items-center gap-2">
              <Trash2 className={cn(compact ? "size-3.5" : "size-4")} />
              Trash
              {compact && (archivedPages?.length ?? 0) > 0 && (
                <Badge>
                  {archivedPages!.length}
                </Badge>
              )}
            </span>
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>

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
                    size={ compact ? "icon-sm" : "icon-xs" }
                    onClick={(e) => onRestore(e, page._id)}
                    title="Restore"
                  >
                    <RotateCcw />
                  </Button>
                  <Button
                    variant="ghost"
                    size={ compact? "icon-sm" : "icon-xs" }
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
