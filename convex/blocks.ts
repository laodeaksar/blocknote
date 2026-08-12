import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPageAccess, tryPageAccess } from "./lib/access";

export const list = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    // Halaman terbit boleh dibaca anonim; selain itu wajib pemilik.
    const access = await tryPageAccess(ctx, args.pageId, "read");
    if (!access) return [];
    
    return await ctx.db
      .query("blocks")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .order("asc")
      .collect();
  },
});

export const upsert = mutation({
  args: {
    pageId: v.id("pages"),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    await assertPageAccess(ctx, args.pageId, "write");
    
    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { content: args.content, position: 0 });
      return existing._id;
    }
    
    return await ctx.db.insert("blocks", {
      pageId: args.pageId,
      content: args.content,
      position: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("blocks"),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db.get(args.id);
    if (!block) throw new Error("Not found");
    
    // Kunci utama: verifikasi kepemilikan halaman induk, bukan sekadar "sudah login".
    await assertPageAccess(ctx, block.pageId, "write");
    
    await ctx.db.patch(args.id, { content: args.content });
  },
});