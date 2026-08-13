"use client"

import { SidebarProvider } from "@/components/ui/sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}
