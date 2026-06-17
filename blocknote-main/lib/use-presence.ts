"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { BlockNoteEditor } from "@blocknote/core";
import { Transaction } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { createCursorPlugin, remoteCursorsKey, RemoteCursor } from "./cursor-plugin";

const CURSOR_COLORS = [
  "#E57373",
  "#81C784",
  "#64B5F6",
  "#FFD54F",
  "#BA68C8",
  "#4DB6AC",
  "#F06292",
  "#FF8A65",
];

function colorForUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

function makeSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type TiptapLike = {
  on(event: string, handler: () => void): void;
  off(event: string, handler: () => void): void;
  registerPlugin(plugin: unknown): void;
  view: EditorView;
};

function getTiptap(editor: BlockNoteEditor): TiptapLike | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (editor as any)._tiptapEditor as TiptapLike | undefined;
}

export function usePresence(
  editor: BlockNoteEditor | null,
  pageId: Id<"pages">,
  userId: string,
  userName: string,
  enabled: boolean
) {
  const sessionId = useRef(makeSessionId()).current;
  const color = colorForUserId(userId || "anon");
  const pluginRegistered = useRef(false);
  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePresence = useMutation(api.presence.update);
  const removePresence = useMutation(api.presence.remove);

  const remoteCursors = useQuery(
    api.presence.list,
    enabled && userId ? { pageId, excludeSessionId: sessionId } : "skip"
  );

  // Register the cursor decoration plugin once the editor is ready.
  useEffect(() => {
    if (!editor || pluginRegistered.current) return;
    const tiptap = getTiptap(editor);
    if (!tiptap) return;
    pluginRegistered.current = true;
    tiptap.registerPlugin(createCursorPlugin());
  }, [editor]);

  // Push remote cursor positions into the ProseMirror plugin state.
  useEffect(() => {
    if (!editor || remoteCursors === undefined) return;
    const tiptap = getTiptap(editor);
    if (!tiptap?.view) return;

    const cursorMap = new Map<string, RemoteCursor>();
    for (const c of remoteCursors) {
      cursorMap.set(`${c.userId}:${c.sessionId}`, {
        userId: c.userId,
        userName: c.userName,
        color: c.color,
        from: c.from,
        to: c.to,
      });
    }

    const { state, dispatch } = tiptap.view;
    const tr: Transaction = state.tr.setMeta(remoteCursorsKey, cursorMap);
    dispatch(tr);
  }, [editor, remoteCursors]);

  // Throttled local cursor broadcaster.
  const sendCursor = useCallback(() => {
    if (throttleTimer.current !== null) return;
    throttleTimer.current = setTimeout(() => {
      throttleTimer.current = null;
      if (!editor || !userId || !enabled) return;
      const tiptap = getTiptap(editor);
      if (!tiptap?.view) return;
      const { from, to } = tiptap.view.state.selection;
      updatePresence({
        pageId,
        sessionId,
        userId,
        userName,
        color,
        from,
        to,
      }).catch(() => {});
    }, 300);
  }, [editor, userId, userName, enabled, pageId, sessionId, color, updatePresence]);

  // Subscribe to TipTap selection / document updates.
  useEffect(() => {
    if (!editor || !enabled) return;
    const tiptap = getTiptap(editor);
    if (!tiptap) return;
    tiptap.on("selectionUpdate", sendCursor);
    tiptap.on("update", sendCursor);
    return () => {
      tiptap.off("selectionUpdate", sendCursor);
      tiptap.off("update", sendCursor);
    };
  }, [editor, enabled, sendCursor]);

  // Remove presence entry when this session unmounts.
  useEffect(() => {
    if (!enabled || !userId) return;
    return () => {
      removePresence({ pageId, sessionId }).catch(() => {});
      if (throttleTimer.current !== null) {
        clearTimeout(throttleTimer.current);
        throttleTimer.current = null;
      }
    };
  }, [pageId, sessionId, userId, enabled, removePresence]);
}
