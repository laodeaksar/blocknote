import { components } from "./_generated/api";
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { assertPageAccess } from "./lib/access";

const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

// `id` dokumen sync = pageId. Tanpa kedua check ini, siapa pun yang tahu
// pageId bisa membaca DAN menulis dokumen orang lain lewat jalur sync.
//
// Cast ke QueryCtx/MutationCtx aman: syncApi hanya mengetik ctx sebagai
// GenericQueryCtx<GenericDataModel> (tipe generic dari komponen pihak ketiga
// yang tidak tahu skema kita), tapi objek runtime-nya identik dengan ctx
// Convex biasa. assertPageAccess hanya memanggil ctx.auth.getUserIdentity()
// dan ctx.db.get() (read-only), jadi tidak ada operasi tulis nyata yang
// terjadi lewat cast ini bahkan di jalur checkWrite.
export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({
  checkRead: async (ctx, id) => {
    await assertPageAccess(ctx as unknown as QueryCtx, id as Id < "pages" > , "read");
  },
  checkWrite: async (ctx, id) => {
    await assertPageAccess(ctx as unknown as MutationCtx, id as Id < "pages" > , "write");
  },
});