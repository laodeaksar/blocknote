"use client";

import {
  Sidebar as UiSidebar,
  SidebarContent as UiSidebarContent,
  SidebarRail,
  useSidebar as useUiSidebar,
} from "@/components/ui/sidebar";
import { SidebarContent as WorkspaceSidebarContent } from "./sidebar-content";

export function Sidebar() {
  const { toggleSidebar } = useUiSidebar();

  return (
    <UiSidebar collapsible="offcanvas" className="border-sidebar-border">
      <UiSidebarContent className="p-0">
        <WorkspaceSidebarContent onCollapse={toggleSidebar} />
      </UiSidebarContent>
      <SidebarRail />
    </UiSidebar>
  );
}

export { MobileSidebar } from "./mobile-sidebar";
export { SidebarContent } from "./sidebar-content";
export { PageItem } from "./page-item";
export { MobilePageItem } from "./mobile-page-item";
export { TrashSection } from "./trash-section";
export { ConfirmDeleteDialog } from "./confirm-delete-dialog";
export type { PageData } from "./types";
