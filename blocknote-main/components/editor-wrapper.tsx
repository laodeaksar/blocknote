"use client";

import dynamic from "next/dynamic";
import type { Id } from "@/convex/_generated/dataModel";

const Editor = dynamic(
  () => import("@/components/editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
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
