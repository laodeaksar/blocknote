"use client";

import { ChevronRight } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { SidebarContent } from "./sidebar-content";

export function Sidebar() {
  const { collapsed, toggle, expand } = useSidebar();

  return (
    <div className="hidden md:flex h-full shrink-0">
      {collapsed ? (
        <button
          onClick={expand}
          title="Expand sidebar  [ "
          className="flex items-center justify-center w-4 h-full bg-sidebar border-r border-border hover:bg-sidebar-hover transition-colors group"
        >
          <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
        </button>
      ) : (
        <aside className="flex flex-col w-60 h-full bg-sidebar border-r border-border">
          <SidebarContent onCollapse={toggle} />
        </aside>
      )}
    </div>
  );
}

export { MobileSidebar } from "./mobile-sidebar";
export { SidebarContent } from "./sidebar-content";
export { PageItem } from "./page-item";
export { MobilePageItem } from "./mobile-page-item";
export { TrashSection } from "./trash-section";
export { ConfirmDeleteDialog } from "./confirm-delete-dialog";
export type { PageData } from "./types";
