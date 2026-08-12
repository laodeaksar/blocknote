import { components } from "./_generated/api";
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import type { Id } from "./_generated/dataModel";
import { assertPageAccess } from "./lib/access";

const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

// `id` dokumen sync = pageId. Tanpa kedua check ini, siapa pun yang tahu
// pageId bisa membaca DAN menulis dokumen orang lain lewat jalur sync.
export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({
  checkRead: async (ctx, id) => {
    await assertPageAccess(ctx, id as Id < "pages" > , "read");
  },
  checkWrite: async (ctx, id) => {
    await assertPageAccess(ctx, id as Id < "pages" > , "write");
  },
});