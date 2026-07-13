"use client"

import { SidebarProvider } from "@/lib/sidebar-context"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}