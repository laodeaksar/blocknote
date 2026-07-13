import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { DocLayout } from "@/components/doc-layout";
import { AppLayout } from "@/components/app-layout";import type { Id } from "@/convex/_generated/dataModel";

type Props = { params: Promise<{ id: string }> };

export default async function DocPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  if (!cookieStore.has("better-auth.session_token")) redirect("/sign-in");

  return (
    <AppLayout>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <MobileSidebar />
        <DocLayout pageId={id as Id<"pages">} />
      </div>
    </AppLayout>
  );
}
