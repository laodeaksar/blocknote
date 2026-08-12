import type { Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

/**
 * Satu-satunya sumber kebenaran untuk otorisasi halaman.
 *
 * mode "read"  -> pemilik, atau siapa pun jika halaman dipublikasikan
 * mode "write" -> hanya pemilik
 */
export async function assertPageAccess(
  ctx: Ctx,
  pageId: Id < "pages" > ,
  mode: "read" | "write"
) {
  const identity = await ctx.auth.getUserIdentity();
  const page = await ctx.db.get(pageId);
  
  if (!page) throw new Error("Not found");
  if (page.isArchived && mode === "read" && !identity) throw new Error("Not found");
  
  if (mode === "read" && page.isPublished && !page.isArchived) {
    return { page, identity };
  }
  
  if (!identity) throw new Error("Not authenticated");
  if (page.userId !== identity.subject) throw new Error("Unauthorized");
  
  return { page, identity };
}

/** Varian read yang mengembalikan null alih-alih melempar (untuk query UI). */
export async function tryPageAccess(
  ctx: Ctx,
  pageId: Id < "pages" > ,
  mode: "read" | "write"
) {
  try {
    return await assertPageAccess(ctx, pageId, mode);
  } catch {
    return null;
  }
}

export async function assertThreadAccess(
  ctx: Ctx,
  threadId: Id < "threads" > ,
  mode: "read" | "write"
) {
  const thread = await ctx.db.get(threadId);
  if (!thread) throw new Error("Not found");
  const { page, identity } = await assertPageAccess(ctx, thread.pageId, mode);
  return { thread, page, identity };
}