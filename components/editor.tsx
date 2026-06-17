"use client";

import { useEditor, EditorContent, type AnyExtension } from "@tiptap/react";
import type { Content } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import { SlashExtension } from "@/lib/slash-extension";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/lib/theme";
import { useEffect, useState, useCallback } from "react";
import { useConvexConnectionState } from "convex/react";
import {
  WifiOff,
  RefreshCw,
  AlertCircle,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePresence } from "@/lib/use-presence";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }, []);

  const banners = (
    <>
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
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="xs"
            variant="ghost"
            className={`shrink-0 ${
              syncError
                ? "bg-red-100 hover:bg-red-200 text-red-700"
                : "bg-amber-100 hover:bg-amber-200 text-amber-700"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Memuat ulang…" : "Coba lagi"}
          </Button>
        </div>
      )}
      {isDisconnected && !isReconnecting && (
        <div className="mb-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 text-gray-500">
          <Spinner className="size-4" />
          Menghubungkan ke server…
        </div>
      )}
    </>
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
      <TiptapEditorInner
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

interface TiptapEditorInnerProps {
  pageId: Id<"pages">;
  editable: boolean;
  extension: AnyExtension;
  initialContent: Content;
  userId: string;
  userName: string;
}

function TiptapEditorInner({
  pageId,
  editable,
  extension,
  initialContent,
  userId,
  userName,
}: TiptapEditorInnerProps) {
  const { resolvedTheme } = useTheme();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getStorageUrl = useMutation(api.files.getStorageUrl);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      const src = await getStorageUrl({ storageId });
      if (!src) throw new Error("Failed to get image URL");
      return src;
    },
    [generateUploadUrl, getStorageUrl]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Mulai menulis…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      Typography,
      SlashExtension.configure({ uploadImage }),
      extension,
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
  });

  usePresence(
    editor ?? null,
    pageId,
    userId,
    userName,
    editable && !!userId
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className={`tiptap-editor ${resolvedTheme === "dark" ? "dark" : ""}`}>
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: e, state }) => {
          const { from, to } = state.selection;
          return (
            from !== to &&
            !e.isActive("image") &&
            !e.isActive("codeBlock")
          );
        }}
      >
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background shadow-lg p-1">
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Kode inline"
          >
            <Code className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-0.5" />
          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Rata kiri"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Rata tengah"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Rata kanan"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarButton>
          <div className="w-px h-5 bg-border mx-0.5" />
          <ToolbarButton
            active={editor.isActive("link")}
            onClick={setLink}
            title="Tautan"
          >
            <Link2 className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
}

function ToolbarButton({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center justify-center w-7 h-7 rounded-md text-sm transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {children}
    </button>
  );
}
