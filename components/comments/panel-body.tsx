"use client";

import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ThreadItem } from "./thread-item";
import type { RawThread, UserInfo } from "./types";

interface PanelBodyProps {
  isPending: boolean;
  threadList: RawThread[];
  active: RawThread[];
  resolved: RawThread[];
  usersMap: Map<string, UserInfo>;
  currentUserId: string;
  activeThreadId?: string;
  onActiveThreadChange?: (id: string | undefined) => void;
}

export function PanelBody({
  isPending,
  threadList,
  active,
  resolved,
  usersMap,
  currentUserId,
  activeThreadId,
  onActiveThreadChange,
}: PanelBodyProps) {
  return (
    <ScrollArea className="flex-1">
      {isPending && <LoadingScreen />}

      {!isPending && threadList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 px-4 text-center">
          <MessageSquare className="size-8 text-muted" />
          <p className="text-sm">Belum ada komentar</p>
          <p className="text-xs">
            Pilih teks di dokumen lalu klik ikon 💬 untuk memulai.
          </p>
        </div>
      )}

      {active.length > 0 && (
        <div className="py-1">
          {active.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              usersMap={usersMap}
              currentUserId={currentUserId}
              isActive={thread.id === activeThreadId}
              onActivate={() => onActiveThreadChange?.(thread.id)}
            />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="py-1">
          <div className="px-4 py-1.5 text-xxs font-semibold uppercase tracking-wide">
            Selesai ({resolved.length})
          </div>
          {resolved.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              usersMap={usersMap}
              currentUserId={currentUserId}
              isActive={thread.id === activeThreadId}
              onActivate={() => onActiveThreadChange?.(thread.id)}
              resolved
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
