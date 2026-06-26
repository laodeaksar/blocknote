"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";

interface EditorContextValue {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  commentsOpen: boolean;
  activeThreadId: string | undefined;
  openComments: (threadId?: string) => void;
  closeComments: () => void;
  toggleComments: () => void;
  setActiveThreadId: (id: string | undefined) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();

  const openComments = useCallback((threadId?: string) => {
    setCommentsOpen(true);
    if (threadId) setActiveThreadId(threadId);
  }, []);

  const closeComments = useCallback(() => {
    setCommentsOpen(false);
    setActiveThreadId(undefined);
  }, []);

  const toggleComments = useCallback(() => setCommentsOpen((v) => !v), []);

  return (
    <EditorContext.Provider
      value={{
        editor,
        setEditor,
        commentsOpen,
        activeThreadId,
        openComments,
        closeComments,
        toggleComments,
        setActiveThreadId,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorContext must be used within EditorProvider");
  return ctx;
}
