"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";

export interface ImageUploadButtonRef {
  trigger: () => void;
}

interface ImageUploadButtonProps {
  editor: Editor | null;
}

export const ImageUploadButton = forwardRef<
  ImageUploadButtonRef,
  ImageUploadButtonProps
>(function ImageUploadButton({ editor }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    trigger() {
      inputRef.current?.click();
    },
  }));

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = "";

    const toastId = toast.loading("Mengupload gambar...");
    try {
      const url = await uploadToCloudinary(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Gambar berhasil disisipkan", { id: toastId });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload gagal",
        { id: toastId }
      );
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleChange}
    />
  );
});
