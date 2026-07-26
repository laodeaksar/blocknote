"use client";

import { useState } from "react";
import { FileCode, FileText, MoreHorizontal, Share2 } from "lucide-react";
import { toast } from "sonner";
import { PublishPopover } from "@/components/publish-popover";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { exportPageAsHTML, exportPageAsMarkdown, type ExportableEditor } from "@/lib/export-page";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface NavbarMoreMenuProps {
  pageId: Id<"pages">;
  title: string;
  isPublished: boolean;
  editor: ExportableEditor | null;
}

export function NavbarMoreMenu({ pageId, title, isPublished, editor }: NavbarMoreMenuProps) {
  const [showPublish, setShowPublish] = useState(false);

  const handleExportHTML = () => {
    if (!editor) return;
    exportPageAsHTML(editor, title);
    toast.success("Diekspor sebagai HTML");
  };

  const handleExportMarkdown = async () => {
    if (!editor) return;
    await exportPageAsMarkdown(editor, title);
    toast.success("Diekspor sebagai Markdown");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "outline-none"
          )}
          aria-label="More options"
        >
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Halaman ini
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowPublish(true)}
            className="gap-2 text-sm cursor-pointer"
          >
            <Share2 className={cn("size-4", isPublished ? "text-success" : "text-muted-foreground")} />
            {isPublished ? "Kelola publikasi" : "Publikasikan ke web"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Export
          </DropdownMenuLabel>
          <DropdownMenuItem disabled={!editor} onClick={handleExportHTML} className="gap-2 text-sm cursor-pointer">
            <FileCode className="size-4 text-muted-foreground" />
            Export as HTML
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!editor} onClick={handleExportMarkdown} className="gap-2 text-sm cursor-pointer">
            <FileText className="size-4 text-muted-foreground" />
            Export as Markdown
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPublish} onOpenChange={setShowPublish}>
        <DialogContent showCloseButton={false} className="p-0 w-auto max-w-none border-0 shadow-xl rounded-xl overflow-hidden">
          <PublishPopover
            pageId={pageId}
            isPublished={isPublished}
            onClose={() => setShowPublish(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
