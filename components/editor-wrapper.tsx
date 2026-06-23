"use client";

import dynamic from "next/dynamic";
import type { Id } from "@/convex/_generated/dataModel";
import { LoadingScreen } from "@/components/ui/loading-screen";

const Editor = dynamic(
  () => import("@/components/editor/index").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <LoadingScreen />
    ),
  }
);

interface EditorWrapperProps {
  pageId: Id<"pages">;
  editable?: boolean;
  onCommentsOpen?: () => void;
}

export function EditorWrapper({ pageId, editable, onCommentsOpen }: EditorWrapperProps) {
  return <Editor pageId={pageId} editable={editable} onCommentsOpen={onCommentsOpen} />;
}
