"use client";

import { Loader2Icon } from "lucide-react"
import dynamic from "next/dynamic";
import type { Id } from "@/convex/_generated/dataModel";

const Editor = dynamic(
  () => import("@/components/editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="size-5 animate-spin" />
      </div>
    ),
  }
);

interface EditorWrapperProps {
  pageId: Id<"pages">;
  editable?: boolean;
}

export function EditorWrapper({ pageId, editable }: EditorWrapperProps) {
  return <Editor pageId={pageId} editable={editable} />;
}
