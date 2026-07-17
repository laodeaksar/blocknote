// components/navbar/navbar-actions.tsx
import { useState, useMemo } from "react";
import { MessageSquare, MoreHorizontal, Share2, FileCode, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { PublishPopover } from "@/components/publish-popover";
import { exportHTML, exportMarkdown } from "./navbar-export";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { Editor } from "@tiptap/react";

export function NavbarActions({
  pageId,
  isPublished,
  editor,
  commentsOpen,
  onToggleComments,
  activeThreadCount
}: {
  pageId: Id < "pages" > ;
  isPublished: boolean;
  editor: Editor | null;
  commentsOpen ? : boolean;
  onToggleComments ? : () => void;
  activeThreadCount: number;
}) {
  const [showPublish, setShowPublish] = useState(false);
  
  const handleExportHTML = () => {
    if (!editor) return;
    exportHTML(editor.getHTML());
    toast.success("Diekspor sebagai HTML");
  };
  const handleExportMD = async () => {
    if (!editor) return;
    await exportMarkdown(editor.getHTML());
    toast.success("Diekspor sebagai Markdown");
  };
  
  return (
    <div className="flex items-center gap-1">
      {onToggleComments && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={onToggleComments} 
                className={cn("relative", commentsOpen && "bg-accent")} />
            }>
                <MessageSquare className={cn("size-4", commentsOpen? "text-foreground" : "text-muted-foreground")} />
                {activeThreadCount > 0 && (
                  <Badge size="count" className="absolute -top-0.5 -right-0.5 bg-warning text-white ring-1 ring-background">
                    {activeThreadCount > 99? "99+" : activeThreadCount}
                  </Badge>
                )}
              </TooltipTrigger>
            
              <TooltipContent side="bottom">
                {activeThreadCount > 0? `Komentar (${activeThreadCount} aktif)` : "Komentar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      )}

      <div className="relative">
        <Popover open={showPublish} onOpenChange={setShowPublish}>
          <PopoverTrigger render={<span className="absolute inset-0 pointer-events-none" />} />
          <PopoverContent align="end" className="w-auto p-0">
            <PublishPopover pageId={pageId} isPublished={isPublished} onClose={() => setShowPublish(false)} />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Halama n ini</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowPublish(true)}>
              <Share2 className={cn("size-4 mr-2", isPublished? "text-success" : "text-muted-foreground")} />
              {isPublished? "Kelola publikasi" : "Publikasikan ke web"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuItem disabled={!editor} onClick={handleExportHTML}>
              <FileCode className="size-4 mr-2" /> Export as HTML
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!editor} onClick={handleExportMD}>
              <FileText className="size-4 mr-2" /> Export as Markdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}