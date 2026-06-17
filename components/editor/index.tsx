"use client";

import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useConvexConnectionState } from "convex/react";
import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { ConnectionBanner } from "./connection-banner";
import { EditorInner } from "./editor-inner";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

interface EditorProps {
  pageId: Id<"pages">;
  editable?: boolean;
}

export function Editor({ pageId, editable = true }: EditorProps) {
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const userName = session?.user?.name ?? session?.user?.email ?? "User";
  const userAvatar = session?.user?.image ?? undefined;

  const upsertUser = useMutation(api.comments.upsertUser);

  useEffect(() => {
    if (!userId || !editable) return;
    upsertUser({ name: userName, avatarUrl: userAvatar }).catch(() => {});
  }, [userId, userName, userAvatar, editable, upsertUser]);

  const handleSyncError = useCallback((error: Error) => {
    setSyncError(error);
  }, []);

  const sync = useTiptapSync(api.prosemirrorSync, pageId, {
    onSyncError: handleSyncError,
  });

  const connectionState = useConvexConnectionState();
  const isDisconnected = !connectionState.isWebSocketConnected;
  const isReconnecting = isDisconnected && connectionState.hasEverConnected;

  useEffect(() => {
    if (connectionState.isWebSocketConnected && syncError) {
      setSyncError(null);
    }
  }, [connectionState.isWebSocketConnected, syncError]);

  useEffect(() => {
    if (!sync.isLoading && sync.initialContent === null) {
      sync.create?.(EMPTY_DOC);
    }
  }, [sync.isLoading, sync.initialContent]);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setSyncError(null);
    setTimeout(() => window.location.reload(), 300);
  }, []);

  const banners = (
    <ConnectionBanner
      syncError={syncError}
      isReconnecting={isReconnecting}
      isDisconnected={isDisconnected}
      isRetrying={isRetrying}
      onRetry={handleRetry}
    />
  );

  if (sync.isLoading || !sync.extension || !sync.initialContent) {
    return (
      <div className="relative">
        {banners}
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {banners}
      <EditorInner
        pageId={pageId}
        editable={editable}
        extension={sync.extension}
        initialContent={sync.initialContent}
        userId={userId}
        userName={userName}
      />
    </div>
  );
}
