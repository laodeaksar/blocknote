import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { FileText, Plus } from "lucide-react";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  if (!cookieStore.has("better-auth.session_token")) redirect("/sign-in");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileSidebar />
      <main className="flex-1 flex items-center justify-center pb-24 md:pb-0">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FileText className="w-16 h-16 text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Welcome to your workspace
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Select a page from the sidebar or create a new one to get started.
          </p>
          <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> Click the + icon in the sidebar to
            create a new page
          </p>
        </div>
      </main>
    </div>
  );
}
