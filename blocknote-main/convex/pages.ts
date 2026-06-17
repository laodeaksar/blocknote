import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const pages = await ctx.db
      .query("pages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    return pages.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return b._creationTime - a._creationTime;
    });
  },
});

export const get = query({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const page = await ctx.db.get(args.id);
    if (!page) return null;

    if (page.isPublished && !page.isArchived) return page;

    if (!identity) throw new Error("Not authenticated");
    if (page.userId !== identity.subject) throw new Error("Unauthorized");

    return page;
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    parentDocument: v.optional(v.id("pages")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const page = await ctx.db.insert("pages", {
      title: args.title ?? "Untitled",
      userId: identity.subject,
      isArchived: false,
      isPublished: false,
      parentDocument: args.parentDocument,
    });

    return page;
  },
});

export const update = mutation({
  args: {
    id: v.id("pages"),
    title: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { id, ...rest } = args;
    const page = await ctx.db.get(id);
    if (!page) throw new Error("Not found");
    if (page.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(id, rest);
    return await ctx.db.get(id);
  },
});

export const archive = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const page = await ctx.db.get(args.id);
    if (!page) throw new Error("Not found");
    if (page.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, { isArchived: true });
  },
});

export const restore = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const page = await ctx.db.get(args.id);
    if (!page) throw new Error("Not found");
    if (page.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, { isArchived: false });
  },
});

export const remove = mutation({
  args: { id: v.id("pages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const page = await ctx.db.get(args.id);
    if (!page) throw new Error("Not found");
    if (page.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("pages")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    for (let i = 0; i < args.orderedIds.length; i++) {
      const page = await ctx.db.get(args.orderedIds[i]);
      if (!page || page.userId !== identity.subject) continue;
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});

export const getArchived = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("pages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();
  },
});
