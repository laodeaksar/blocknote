import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .order("asc")
      .collect();

    return blocks;
  },
});

export const upsert = mutation({
  args: {
    pageId: v.id("pages"),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        position: 0,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("blocks", {
        pageId: args.pageId,
        content: args.content,
        position: 0,
      });
    }
  },
});

export const update = mutation({
  args: {
    id: v.id("blocks"),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.patch(args.id, { content: args.content });
  },
});
