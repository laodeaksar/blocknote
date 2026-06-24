import { EditorWrapper } from "@/components/editor-wrapper";
import type { Id } from "@/convex/_generated/dataModel";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export default async function PublicPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 h-11 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground text-[10px] font-bold">N</span>
          </div>
          <span className="text-xs text-muted-foreground">Public page</span>
        </div>
        <Link
          href="/sign-in"
          className={buttonVariants({ variant: "link", size: "xs" })}
        >
          <ExternalLink data-icon="inline-start" />
          Open in app
        </Link>
      </header>

      <main className="max-w-4xl mx-auto py-16 px-4 md:px-16">
        <EditorWrapper pageId={id as Id<"pages">} editable={false} />
      </main>
    </div>
  );
}
