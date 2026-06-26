"use client";

import dynamic from "next/dynamic";
import type { Id } from "@/convex/_generated/dataModel";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useEditorContext } from "@/lib/editor-context";

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
}

export function EditorWrapper({ pageId, editable }: EditorWrapperProps) {
  const { openComments } = useEditorContext();
  return (
    <Editor pageId={pageId} editable={editable} onCommentsOpen={openComments} />
  );
}
