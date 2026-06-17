"use client";

import { useEffect, useMemo, useRef } from "react";
import { useConvex, useQuery } from "convex/react";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ThreadStore,
  DefaultThreadStoreAuth,
} from "@blocknote/core/comments";
import type {
  ThreadData,
  CommentData,
  CommentBody,
  CommentReactionData,
  User,
} from "@blocknote/core/comments";

type RawReaction = { emoji: string; createdAt: number; userId: string };

type RawComment = {
  id: string;
  userId: string;
  body?: CommentBody;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  metadata?: unknown;
  reactions: RawReaction[];
};

type RawThread = {
  id: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
  resolvedBy?: string;
  resolvedUpdatedAt?: number;
  metadata?: unknown;
  comments: RawComment[];
};

function groupReactions(reactions: RawReaction[]): CommentReactionData[] {
  const map = new Map<string, CommentReactionData>();
  for (const r of reactions) {
    const existing = map.get(r.emoji);
    if (existing) {
      existing.userIds.push(r.userId);
    } else {
      map.set(r.emoji, {
        emoji: r.emoji,
        createdAt: new Date(r.createdAt),
        userIds: [r.userId],
      });
    }
  }
  return Array.from(map.values());
}

function rawToCommentData(raw: RawComment): CommentData {
  const base = {
    type: "comment" as const,
    id: raw.id,
    userId: raw.userId,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    reactions: groupReactions(raw.reactions),
    metadata: raw.metadata ?? null,
  };
  if (raw.deletedAt !== undefined) {
    return { ...base, deletedAt: new Date(raw.deletedAt), body: undefined };
  }
  return { ...base, body: raw.body };
}

function rawToThreadData(raw: RawThread): ThreadData {
  return {
    type: "thread",
    id: raw.id,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    resolved: raw.resolved,
    resolvedBy: raw.resolvedBy,
    resolvedUpdatedAt: raw.resolvedUpdatedAt
      ? new Date(raw.resolvedUpdatedAt)
      : undefined,
    metadata: raw.metadata ?? null,
    comments: raw.comments.map(rawToCommentData),
  };
}

class ConvexThreadStore extends ThreadStore {
  addThreadToDocument = undefined;

  constructor(
    private readonly convex: ReturnType<typeof useConvex>,
    private readonly pageId: Id<"pages">,
    private readonly userId: string,
    auth: DefaultThreadStoreAuth,
    public readonly threadsRef: React.MutableRefObject<Map<string, ThreadData>>,
    public readonly subscribersRef: React.MutableRefObject<
      Set<(t: Map<string, ThreadData>) => void>
    >
  ) {
    super(auth);
  }

  private notify() {
    this.subscribersRef.current.forEach((cb) => cb(this.threadsRef.current));
  }

  async createThread(options: {
    initialComment: { body: CommentBody; metadata?: unknown };
    metadata?: unknown;
  }): Promise<ThreadData> {
    const raw = await this.convex.mutation(api.comments.createThread, {
      pageId: this.pageId,
      body: options.initialComment.body,
      metadata: options.initialComment.metadata,
      threadMetadata: options.metadata,
    });
    const thread = rawToThreadData(raw as RawThread);
    const next = new Map(this.threadsRef.current);
    next.set(thread.id, thread);
    this.threadsRef.current = next;
    this.notify();
    return thread;
  }

  async addComment(options: {
    comment: { body: CommentBody; metadata?: unknown };
    threadId: string;
  }): Promise<CommentData> {
    const raw = await this.convex.mutation(api.comments.addComment, {
      threadId: options.threadId as Id<"threads">,
      body: options.comment.body,
      metadata: options.comment.metadata,
    });
    const comment = rawToCommentData(raw as RawComment);
    const thread = this.threadsRef.current.get(options.threadId);
    if (thread) {
      const next = new Map(this.threadsRef.current);
      next.set(options.threadId, {
        ...thread,
        updatedAt: new Date(),
        comments: [...thread.comments, comment],
      });
      this.threadsRef.current = next;
      this.notify();
    }
    return comment;
  }

  async updateComment(options: {
    comment: { body: CommentBody; metadata?: unknown };
    threadId: string;
    commentId: string;
  }): Promise<void> {
    await this.convex.mutation(api.comments.updateComment, {
      commentId: options.commentId as Id<"comments">,
      body: options.comment.body,
      metadata: options.comment.metadata,
    });
  }

  async deleteComment(options: {
    threadId: string;
    commentId: string;
  }): Promise<void> {
    await this.convex.mutation(api.comments.deleteComment, {
      commentId: options.commentId as Id<"comments">,
      threadId: options.threadId as Id<"threads">,
    });
  }

  async deleteThread(options: { threadId: string }): Promise<void> {
    await this.convex.mutation(api.comments.deleteThread, {
      threadId: options.threadId as Id<"threads">,
    });
    const next = new Map(this.threadsRef.current);
    next.delete(options.threadId);
    this.threadsRef.current = next;
    this.notify();
  }

  async resolveThread(options: { threadId: string }): Promise<void> {
    await this.convex.mutation(api.comments.resolveThread, {
      threadId: options.threadId as Id<"threads">,
    });
  }

  async unresolveThread(options: { threadId: string }): Promise<void> {
    await this.convex.mutation(api.comments.unresolveThread, {
      threadId: options.threadId as Id<"threads">,
    });
  }

  async addReaction(options: {
    threadId: string;
    commentId: string;
    emoji: string;
  }): Promise<void> {
    await this.convex.mutation(api.comments.addReaction, {
      commentId: options.commentId as Id<"comments">,
      threadId: options.threadId as Id<"threads">,
      emoji: options.emoji,
    });
  }

  async deleteReaction(options: {
    threadId: string;
    commentId: string;
    emoji: string;
  }): Promise<void> {
    await this.convex.mutation(api.comments.deleteReaction, {
      commentId: options.commentId as Id<"comments">,
      threadId: options.threadId as Id<"threads">,
      emoji: options.emoji,
    });
  }

  getThread(threadId: string): ThreadData {
    const t = this.threadsRef.current.get(threadId);
    if (!t) throw new Error(`Thread not found: ${threadId}`);
    return t;
  }

  getThreads(): Map<string, ThreadData> {
    return this.threadsRef.current;
  }

  subscribe(cb: (threads: Map<string, ThreadData>) => void): () => void {
    this.subscribersRef.current.add(cb);
    return () => this.subscribersRef.current.delete(cb);
  }
}

export function useConvexThreadStore(
  pageId: Id<"pages">,
  userId: string,
  userName: string
) {
  const convex = useConvex();
  const threadsRef = useRef<Map<string, ThreadData>>(new Map());
  const subscribersRef = useRef<Set<(t: Map<string, ThreadData>) => void>>(
    new Set()
  );

  const { data: rawThreads } = useTanstackQuery(
    convexQuery(api.comments.listForPage, { pageId })
  );

  useEffect(() => {
    if (!rawThreads) return;
    const map = new Map<string, ThreadData>();
    for (const raw of rawThreads as RawThread[]) {
      const thread = rawToThreadData(raw);
      map.set(thread.id, thread);
    }
    threadsRef.current = map;
    subscribersRef.current.forEach((cb) => cb(map));
  }, [rawThreads]);

  const store = useMemo(() => {
    const auth = new DefaultThreadStoreAuth(userId || "anonymous", "editor");
    return new ConvexThreadStore(
      convex,
      pageId,
      userId,
      auth,
      threadsRef,
      subscribersRef
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convex, pageId, userId]);

  const resolveUsers = useMemo(
    () =>
      async (userIds: string[]): Promise<User[]> => {
        const users = await convex.query(api.comments.getUsersByIds, {
          userIds,
        });
        return users as User[];
      },
    [convex]
  );

  return { store, resolveUsers };
}
