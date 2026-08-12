import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assertPageAccess, tryPageAccess } from "./lib/access";

export const PRESENCE_TTL = 30_000;

export const update = mutation({
  // userId/userName TIDAK lagi diterima dari klien — diambil dari sesi
  // supaya kursor orang lain tidak bisa dipalsukan.
  args: {
    pageId: v.id("pages"),
    sessionId: v.string(),
    color: v.string(),
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    const { identity } = await assertPageAccess(ctx, args.pageId, "write");
    if (!identity) throw new Error("Not authenticated");
    
    const userId = identity.subject;
    const userName = identity.name ?? identity.nickname ?? "User";
    
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_page_session", (q) =>
        q.eq("pageId", args.pageId).eq("sessionId", args.sessionId)
      )
      .unique();
    
    if (existing) {
      // Cegah satu user membajak sessionId milik user lain.
      if (existing.userId !== userId) throw new Error("Unauthorized");
      
      await ctx.db.patch(existing._id, {
        userName,
        color: args.color,
        from: args.from,
        to: args.to,
        updatedAt: Date.now(),
      });
      return;
    }
    
    await ctx.db.insert("presence", {
      pageId: args.pageId,
      sessionId: args.sessionId,
      userId,
      userName,
      color: args.color,
      from: args.from,
      to: args.to,
      updatedAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    pageId: v.id("pages"),
    excludeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const access = await tryPageAccess(ctx, args.pageId, "read");
    if (!access) return [];
    
    const cutoff = Date.now() - PRESENCE_TTL;
    const all = await ctx.db
      .query("presence")
      .withIndex("by_page", (q) => q.eq("pageId", args.pageId))
      .collect();
    
    return all.filter((p) => p.sessionId !== args.excludeSessionId && p.updatedAt > cutoff);
  },
});

export const remove = mutation({
  args: {
    pageId: v.id("pages"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_page_session", (q) =>
        q.eq("pageId", args.pageId).eq("sessionId", args.sessionId)
      )
      .unique();
    
    if (existing && existing.userId === identity.subject) {
      await ctx.db.delete(existing._id);
    }
  },
});

/** Dipanggil oleh cron: hapus baris presence basi (tab ditutup paksa). */
export const cleanupStale = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - PRESENCE_TTL * 4;
    const stale = await ctx.db
      .query("presence")
      .withIndex("by_updatedAt", (q) => q.lt("updatedAt", cutoff))
      .take(500);
    
    await Promise.all(stale.map((p) => ctx.db.delete(p._id)));
    return stale.length;
  },
});