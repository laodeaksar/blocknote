"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { Throttler } from "@tanstack/pacer";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Editor } from "@tiptap/react";
import { Transaction } from "@tiptap/pm/state";
import { createCursorPlugin, remoteCursorsKey, RemoteCursor } from "./extensions/cursor-plugin";

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

export function usePresence(
  editor: Editor | null,
  pageId: Id<"pages">,
  userId: string,
  userName: string,
  enabled: boolean
) {
  const sessionId = useRef(makeSessionId()).current;
  const color = colorForUserId(userId || "anon");
  const pluginRegistered = useRef(false);

  const updatePresence = useMutation(api.presence.update);
  const removePresence = useMutation(api.presence.remove);

  const remoteCursors = useQuery(
    api.presence.list,
    enabled && userId ? { pageId, excludeSessionId: sessionId } : "skip"
  );

  useEffect(() => {
    if (!editor || pluginRegistered.current) return;
    pluginRegistered.current = true;
    editor.registerPlugin(createCursorPlugin());
  }, [editor]);

  useEffect(() => {
    if (!editor || remoteCursors === undefined) return;
    if (!editor.view) return;

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

    const { state, dispatch } = editor.view;
    const tr: Transaction = state.tr.setMeta(remoteCursorsKey, cursorMap);
    dispatch(tr);
  }, [editor, remoteCursors]);

  const updatePresenceRef = useRef(updatePresence);
  updatePresenceRef.current = updatePresence;

  const throttlerRef = useRef<Throttler<() => void> | null>(null);

  const sendCursor = useCallback(() => {
    if (!throttlerRef.current) {
      throttlerRef.current = new Throttler(() => {
        if (!editor || !userId || !enabled) return;
        if (!editor.view) return;
        const { from, to } = editor.view.state.selection;
        updatePresenceRef.current({
          pageId,
          sessionId,
          userId,
          userName,
          color,
          from,
          to,
        }).catch(() => {});
      }, { wait: 300, leading: false, trailing: true });
    }
    throttlerRef.current.maybeExecute();
  }, [editor, userId, userName, enabled, pageId, sessionId, color]);

  useEffect(() => {
    if (!editor || !enabled) return;
    editor.on("selectionUpdate", sendCursor);
    editor.on("update", sendCursor);
    return () => {
      editor.off("selectionUpdate", sendCursor);
      editor.off("update", sendCursor);
    };
  }, [editor, enabled, sendCursor]);

  useEffect(() => {
    if (!enabled || !userId) return;
    return () => {
      removePresence({ pageId, sessionId }).catch(() => {});
      throttlerRef.current?.cancel();
      throttlerRef.current = null;
    };
  }, [pageId, sessionId, userId, enabled, removePresence]);
}
