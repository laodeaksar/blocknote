import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMyTheme = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    return user?.theme ?? null;
  },
});

export const setMyTheme = mutation({
  args: {
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { theme: args.theme });
    }
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user) return null;
    return { name: user.name, avatarColor: user.avatarColor ?? null };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    avatarColor: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        name: args.name,
        avatarColor: args.avatarColor,
      });
    }
  },
});
