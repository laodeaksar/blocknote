"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

const STORAGE_KEY = "sidebar:collapsed"

interface SidebarContextValue {
  collapsed: boolean
  toggle: () => void
  expand: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem(STORAGE_KEY) === "true"
    } catch {
      return false
    }
  })

  const setAndPersist = (value: boolean) => {
    setCollapsed(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {}
  }

  useEffect(() => {
    if (isDesktop) setAndPersist(false)
  }, [isDesktop])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return
      if (e.key === "[" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setAndPersist(!collapsed)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [collapsed])

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggle: () => setAndPersist(!collapsed),
        expand: () => setAndPersist(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}
