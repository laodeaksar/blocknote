"use client";
import { AppLayout } from "@/components/app-layout";
import { Sidebar, MobileSidebar } from "@/components/sidebar";

export default function DebugPage() {
  return (
    <AppLayout>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <MobileSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-foreground font-medium">Debug Layout Test</p>
            <p className="text-sm text-muted-foreground">If sidebar is visible on the left, layout is correct.</p>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
