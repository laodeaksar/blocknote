"use client";

import "@blocknote/shadcn/style.css";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  FormattingToolbar,
  FormattingToolbarController,
  SideMenuController,
  DragHandleButton,
  SideMenu,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  CreateLinkButton,
  NestBlockButton,
  UnnestBlockButton,
  AddCommentButton,
  FloatingComposerController,
  FloatingThreadController,
} from "@blocknote/react";
import { CommentsExtension } from "@blocknote/core/comments";
import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/lib/theme";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useConvexConnectionState } from "convex/react";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useConvexThreadStore } from "@/lib/thread-store";
import { usePresence } from "@/lib/use-presence";

const EMPTY_DOC = { type: "doc", content: [] };

interface EditorProps {
  pageId: Id<"pages">;
  editable?: boolean;
}

export function Editor({ pageId, editable = true }: EditorProps) {
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const userName =
    session?.user?.name ?? session?.user?.email ?? "User";
  const userAvatar = session?.user?.image ?? undefined;

  const upsertUser = useMutation(api.comments.upsertUser);

  useEffect(() => {
    if (!userId || !editable) return;
    upsertUser({ name: userName, avatarUrl: userAvatar }).catch(() => {});
  }, [userId, userName, userAvatar, editable, upsertUser]);

  const { store: threadStore, resolveUsers } = useConvexThreadStore(
    pageId,
    editable ? userId : "",
    userName
  );

  const commentsExtension = useMemo(() => {
    if (!editable || !userId || !threadStore || !resolveUsers) return null;
    return CommentsExtension({ threadStore, resolveUsers });
  }, [editable, userId, threadStore, resolveUsers]);

  const handleSyncError = useCallback((error: Error) => {
    setSyncError(error);
  }, []);

  const sync = useBlockNoteSync(api.prosemirrorSync, pageId, {
    onSyncError: handleSyncError,
    editorOptions: commentsExtension
      ? { extensions: [commentsExtension] }
      : undefined,
  });
  const { resolvedTheme } = useTheme();
  const connectionState = useConvexConnectionState();

  const isDisconnected = !connectionState.isWebSocketConnected;
  const isReconnecting = isDisconnected && connectionState.hasEverConnected;

  useEffect(() => {
    if (connectionState.isWebSocketConnected && syncError) {
      setSyncError(null);
    }
  }, [connectionState.isWebSocketConnected, syncError]);

  useEffect(() => {
    if (!sync.isLoading && !sync.editor) {
      sync.create(EMPTY_DOC);
    }
  }, [sync.isLoading, sync.editor]);

  usePresence(
    sync.editor,
    pageId,
    userId,
    userName,
    editable && !!userId
  );

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setSyncError(null);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }, []);

  const renderFormattingToolbar = useCallback(
    () => (
      <FormattingToolbar>
        <BasicTextStyleButton basicTextStyle="bold" key="bold" />
        <BasicTextStyleButton basicTextStyle="italic" key="italic" />
        <BasicTextStyleButton basicTextStyle="underline" key="underline" />
        <BasicTextStyleButton basicTextStyle="strike" key="strike" />
        <BasicTextStyleButton basicTextStyle="code" key="code" />
        <TextAlignButton textAlignment="left" key="left" />
        <TextAlignButton textAlignment="center" key="center" />
        <TextAlignButton textAlignment="right" key="right" />
        <ColorStyleButton key="color" />
        <NestBlockButton key="nest" />
        <UnnestBlockButton key="unnest" />
        <CreateLinkButton key="link" />
        {editable && commentsExtension && (
          <AddCommentButton key="comment" />
        )}
      </FormattingToolbar>
    ),
    [editable, commentsExtension]
  );

  if (sync.isLoading || !sync.editor) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {(isReconnecting || syncError) && (
        <div
          className={`mb-3 flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm ${
            syncError
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-amber-50 border border-amber-200 text-amber-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {syncError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <WifiOff className="w-4 h-4 shrink-0" />
            )}
            {syncError
              ? "Gagal menyinkronkan perubahan."
              : "Koneksi terputus. Mencoba menghubungkan kembali…"}
          </span>

          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-colors shrink-0 ${
              syncError
                ? "bg-red-100 hover:bg-red-200 text-red-700"
                : "bg-amber-100 hover:bg-amber-200 text-amber-700"
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Memuat ulang…" : "Coba lagi"}
          </button>
        </div>
      )}

      {isDisconnected && !isReconnecting && (
        <div className="mb-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin shrink-0" />
          Menghubungkan ke server…
        </div>
      )}

      <BlockNoteView
        editor={sync.editor}
        editable={editable}
        theme={resolvedTheme as "light" | "dark" | undefined}
        sideMenu={false}
        formattingToolbar={false}
      >
        <FormattingToolbarController
          formattingToolbar={renderFormattingToolbar}
        />
        <SideMenuController
          sideMenu={(props) => (
            <SideMenu {...props}>
              <DragHandleButton {...props} />
            </SideMenu>
          )}
        />
        {commentsExtension && (
          <>
            <FloatingComposerController
              floatingUIOptions={{
                useDismissProps: { outsidePressEvent: "click" },
              }}
            />
            <FloatingThreadController />
          </>
        )}
      </BlockNoteView>
    </div>
  );
}
