"use client";

import dynamic from "next/dynamic";
import type { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner"


const Editor = dynamic(
  () => import("@/components/editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-5" />
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
