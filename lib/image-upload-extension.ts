import { Extension } from "@tiptap/core";

export interface ImageUploadOptions {
  onTrigger: (() => void) | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      uploadImage: () => ReturnType;
    };
  }
}

export const ImageUploadExtension = Extension.create<ImageUploadOptions>({
  name: "imageUpload",

  addOptions() {
    return {
      onTrigger: null,
    };
  },

  addCommands() {
    return {
      uploadImage:
        () =>
        () => {
          this.options.onTrigger?.();
          return true;
        },
    };
  },
});
