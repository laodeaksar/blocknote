import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const PRESENCE_TTL = 30_000;

export const update = mutation({
  args: {
    pageId: v.id("pages"),
    sessionId: v.string(),
    userId: v.string(),
    userName: v.string(),
    color: v.string(),
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_page_session", (q) =>
        q.eq("pageId", args.pageId).eq("sessionId", args.sessionId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        userName: args.userName,
        color: args.color,
        from: args.from,
        to: args.to,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

export const list = query({
  args: {
    pageId: v.id("pages"),
    excludeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - PRESENCE_TTL;
    const all = await ctx.db
      .query("presence")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();

    return all.filter(
      (p) => p.sessionId !== args.excludeSessionId && p.updatedAt > cutoff
    );
  },
});

export const remove = mutation({
  args: {
    pageId: v.id("pages"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_page_session", (q) =>
        q.eq("pageId", args.pageId).eq("sessionId", args.sessionId)
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
