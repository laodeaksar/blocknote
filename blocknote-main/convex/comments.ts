import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listForPage = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const threads = await ctx.db
      .query("threads")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .collect();

    return Promise.all(
      threads.map(async (thread) => {
        const comments = await ctx.db
          .query("comments")
          .filter((q) => q.eq(q.field("threadId"), thread._id))
          .collect();

        return {
          id: thread._id as string,
          createdAt: thread._creationTime,
          updatedAt: thread.updatedAt,
          resolved: thread.resolved,
          resolvedBy: thread.resolvedBy,
          resolvedUpdatedAt: thread.resolvedUpdatedAt,
          metadata: thread.metadata,
          comments: comments.map((c) => ({
            id: c._id as string,
            userId: c.userId,
            body: c.body,
            createdAt: c._creationTime,
            updatedAt: c.updatedAt,
            deletedAt: c.deletedAt,
            metadata: c.metadata,
            reactions: c.reactions,
          })),
        };
      })
    );
  },
});

export const getUsersByIds = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    return Promise.all(
      args.userIds.map(async (userId) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), userId))
          .first();
        return {
          id: userId,
          username: user?.name ?? "User",
          avatarUrl: user?.avatarUrl ?? "",
        };
      })
    );
  },
});

export const upsertUser = mutation({
  args: { name: v.string(), avatarUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
    } else {
      await ctx.db.insert("users", {
        userId: identity.subject,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
    }
  },
});

export const createThread = mutation({
  args: {
    pageId: v.id("pages"),
    body: v.any(),
    metadata: v.optional(v.any()),
    threadMetadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();

    const threadId = await ctx.db.insert("threads", {
      pageId: args.pageId,
      resolved: false,
      updatedAt: now,
      metadata: args.threadMetadata,
    });

    const commentId = await ctx.db.insert("comments", {
      threadId,
      userId: identity.subject,
      body: args.body,
      updatedAt: now,
      reactions: [],
      metadata: args.metadata,
    });

    const thread = await ctx.db.get(threadId);
    const comment = await ctx.db.get(commentId);

    return {
      id: threadId as string,
      createdAt: thread!._creationTime,
      updatedAt: now,
      resolved: false,
      metadata: args.threadMetadata,
      comments: [
        {
          id: commentId as string,
          userId: identity.subject,
          body: args.body,
          createdAt: comment!._creationTime,
          updatedAt: now,
          metadata: args.metadata,
          reactions: [] as { emoji: string; createdAt: number; userId: string }[],
        },
      ],
    };
  },
});

export const addComment = mutation({
  args: {
    threadId: v.id("threads"),
    body: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();

    await ctx.db.patch(args.threadId, { updatedAt: now });

    const commentId = await ctx.db.insert("comments", {
      threadId: args.threadId,
      userId: identity.subject,
      body: args.body,
      updatedAt: now,
      reactions: [],
      metadata: args.metadata,
    });

    const comment = await ctx.db.get(commentId);

    return {
      id: commentId as string,
      userId: identity.subject,
      body: args.body,
      createdAt: comment!._creationTime,
      updatedAt: now,
      metadata: args.metadata,
      reactions: [] as { emoji: string; createdAt: number; userId: string }[],
    };
  },
});

export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    body: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== identity.subject) throw new Error("Unauthorized");

    const now = Date.now();
    await ctx.db.patch(args.commentId, {
      body: args.body,
      metadata: args.metadata,
      updatedAt: now,
    });
    await ctx.db.patch(comment.threadId, { updatedAt: now });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments"), threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.delete(args.commentId);

    const remaining = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();

    if (remaining.length === 0) {
      await ctx.db.delete(args.threadId);
    } else {
      await ctx.db.patch(args.threadId, { updatedAt: Date.now() });
    }
  },
});

export const deleteThread = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .collect();

    await Promise.all(comments.map((c) => ctx.db.delete(c._id)));
    await ctx.db.delete(args.threadId);
  },
});

export const resolveThread = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    await ctx.db.patch(args.threadId, {
      resolved: true,
      resolvedBy: identity.subject,
      resolvedUpdatedAt: now,
      updatedAt: now,
    });
  },
});

export const unresolveThread = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = Date.now();
    await ctx.db.patch(args.threadId, {
      resolved: false,
      resolvedBy: undefined,
      resolvedUpdatedAt: now,
      updatedAt: now,
    });
  },
});

export const addReaction = mutation({
  args: {
    commentId: v.id("comments"),
    threadId: v.id("threads"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const alreadyReacted = comment.reactions.some(
      (r: { emoji: string; userId: string }) =>
        r.emoji === args.emoji && r.userId === identity.subject
    );
    if (alreadyReacted) return;

    const now = Date.now();
    await ctx.db.patch(args.commentId, {
      reactions: [
        ...comment.reactions,
        { emoji: args.emoji, createdAt: now, userId: identity.subject },
      ],
      updatedAt: now,
    });
    await ctx.db.patch(args.threadId, { updatedAt: now });
  },
});

export const deleteReaction = mutation({
  args: {
    commentId: v.id("comments"),
    threadId: v.id("threads"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const now = Date.now();
    await ctx.db.patch(args.commentId, {
      reactions: comment.reactions.filter(
        (r: { emoji: string; userId: string }) =>
          !(r.emoji === args.emoji && r.userId === identity.subject)
      ),
      updatedAt: now,
    });
    await ctx.db.patch(args.threadId, { updatedAt: now });
  },
});
