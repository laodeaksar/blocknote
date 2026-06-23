import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { toast } from "sonner";

export interface ImageDropPasteOptions {
  onUpload: ((file: File) => Promise<string>) | null;
}

const imageDropPasteKey = new PluginKey("imageDropPaste");

async function insertImageFromFile(
  file: File,
  view: EditorView,
  pos: number | null,
  onUpload: (file: File) => Promise<string>
) {
  const toastId = toast.loading("Mengupload gambar...");
  try {
    const url = await onUpload(file);
    const { schema } = view.state;
    const node = schema.nodes.image?.create({ src: url });
    if (!node) {
      toast.error("Tipe gambar tidak didukung", { id: toastId });
      return;
    }
    const transaction =
      pos !== null
        ? view.state.tr.insert(pos, node)
        : view.state.tr.replaceSelectionWith(node);
    view.dispatch(transaction);
    toast.success("Gambar berhasil disisipkan", { id: toastId });
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : "Upload gagal",
      { id: toastId }
    );
  }
}

export const ImageDropPasteExtension = Extension.create<ImageDropPasteOptions>({
  name: "imageDropPaste",

  addOptions() {
    return { onUpload: null };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: imageDropPasteKey,
        props: {
          handlePaste(view, event) {
            if (!options.onUpload) return false;
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of Array.from(items)) {
              if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) {
                  event.preventDefault();
                  insertImageFromFile(file, view, null, options.onUpload);
                  return true;
                }
              }
            }
            return false;
          },

          handleDrop(view, event, _slice, moved) {
            if (!options.onUpload) return false;
            if (moved) return false;

            const files = event.dataTransfer?.files;
            if (!files?.length) return false;

            const imageFile = Array.from(files).find((f) =>
              f.type.startsWith("image/")
            );
            if (!imageFile) return false;

            event.preventDefault();
            const coords = { left: event.clientX, top: event.clientY };
            const pos = view.posAtCoords(coords)?.pos ?? null;
            insertImageFromFile(imageFile, view, pos, options.onUpload);
            return true;
          },
        },
      }),
    ];
  },
});
