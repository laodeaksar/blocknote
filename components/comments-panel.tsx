"use client";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { PanelBody } from "@/components/comments/panel-body";
import { useMediaQuery } from "@/hooks/use-media-query";
import { authClient } from "@/lib/auth-client";
import { useMemo } from "react";
import type { RawThread, UserInfo } from "@/components/comments/types";

interface CommentsPanelProps {
  pageId: Id<"pages">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeThreadId?: string;
  onActiveThreadChange?: (threadId: string | undefined) => void;
}

export function CommentsPanel({
  pageId,
  open,
  onOpenChange,
  activeThreadId,
  onActiveThreadChange,
}: CommentsPanelProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? "";

  const { data: threads, isPending } = useQuery(
    convexQuery(api.comments.listForPage, { pageId })
  );

  const threadList = (threads as RawThread[] | undefined) ?? [];
  const active = threadList.filter((t) => !t.resolved);
  const resolved = threadList.filter((t) => t.resolved);

  const userIds = useMemo(() => {
    const ids = new Set<string>();
    for (const thread of threadList) {
      for (const c of thread.comments) {
        if (!c.deletedAt) ids.add(c.userId);
      }
    }
    return Array.from(ids);
  }, [threadList]);

  const { data: users } = useQuery(
    convexQuery(api.comments.getUsersByIds, { userIds })
  );

  const usersMap = useMemo(() => {
    const map = new Map<string, UserInfo>();
    for (const u of (users as UserInfo[] | undefined) ?? []) map.set(u.id, u);
    return map;
  }, [users]);

  const bodyProps = {
    isPending,
    threadList,
    active,
    resolved,
    usersMap,
    currentUserId,
    activeThreadId,
    onActiveThreadChange,
  };

  const headerContent = (
    <div className="flex items-center gap-2">
      <MessageSquare className="size-4 text-muted-foreground" />
      <span className="text-sm font-medium">Komentar</span>
      {active.length > 0 && (
        <span className="text-xxs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium leading-none">
          {active.length}
        </span>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex flex-col max-h-[85vh]">
          <DrawerHeader className="px-4 py-3 border-b border-border shrink-0 !text-left gap-0">
            <DrawerTitle className="sr-only">Komentar</DrawerTitle>
            {headerContent}
          </DrawerHeader>
          <PanelBody {...bodyProps} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 flex flex-col gap-0" swipeToClose={false}>
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="sr-only">Komentar</SheetTitle>
          {headerContent}
        </SheetHeader>
        <PanelBody {...bodyProps} />
      </SheetContent>
    </Sheet>
  );
}
