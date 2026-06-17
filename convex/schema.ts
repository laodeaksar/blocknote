import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pages: defineTable({
    title: v.string(),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    userId: v.string(),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    parentDocument: v.optional(v.id("pages")),
    order: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  blocks: defineTable({
    pageId: v.id("pages"),
    content: v.any(),
    position: v.number(),
  }).index("by_page", ["pageId"]),

  users: defineTable({
    userId: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarColor: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
  }).index("by_userId", ["userId"]),

  threads: defineTable({
    pageId: v.id("pages"),
    resolved: v.boolean(),
    resolvedBy: v.optional(v.string()),
    resolvedUpdatedAt: v.optional(v.number()),
    updatedAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_page", ["pageId"]),

  comments: defineTable({
    threadId: v.id("threads"),
    userId: v.string(),
    body: v.optional(v.any()),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    reactions: v.array(
      v.object({
        emoji: v.string(),
        createdAt: v.number(),
        userId: v.string(),
      })
    ),
  }).index("by_thread", ["threadId"]),

  presence: defineTable({
    pageId: v.id("pages"),
    userId: v.string(),
    sessionId: v.string(),
    userName: v.string(),
    color: v.string(),
    from: v.number(),
    to: v.number(),
    updatedAt: v.number(),
  })
    .index("by_page", ["pageId"])
    .index("by_page_session", ["pageId", "sessionId"]),
});
