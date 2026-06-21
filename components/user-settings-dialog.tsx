"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui/avatar";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePending } from "@/hooks/use-pending";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { fileToDataUrl } from "@/lib/image-crop";
import { Check, Camera, X } from "lucide-react";
import { toast } from "sonner";

const AVATAR_COLORS = [
  { value: "#6b7280", label: "Gray" },
  { value: "#e16259", label: "Red" },
  { value: "#e8943a", label: "Orange" },
  { value: "#d9a53b", label: "Yellow" },
  { value: "#6bba7f", label: "Green" },
  { value: "#4a9bbe", label: "Blue" },
  { value: "#8b6dbf", label: "Purple" },
  { value: "#d16b9f", label: "Pink" },
];

const DEFAULT_COLOR = "#6b7280";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UserSettingsDialog({ open, onClose }: Props) {
  const { data: session } = authClient.useSession();
  const profile = useQuery(api.users.getMyProfile, session?.user ? {} : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const { isPending: saving, run: runSave } = usePending();
  const { isPending: uploading, run: runUpload } = usePending();

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && profile !== undefined) {
      setName(profile?.name ?? session?.user?.name ?? "");
      setColor(profile?.avatarColor ?? DEFAULT_COLOR);
      setAvatarUrl(profile?.avatarUrl ?? null);
    }
  }, [open, profile, session?.user?.name]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Foto terlalu besar. Maksimal 10 MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setCropSrc(dataUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropApply = (blob: Blob) => {
    setCropSrc(null);
    const croppedFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    runUpload(async () => {
      try {
        const url = await uploadToCloudinary(croppedFile);
        setAvatarUrl(url);
      } catch {
        toast.error("Gagal mengupload foto. Pastikan Cloudinary sudah dikonfigurasi.");
      }
    });
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    if (!name.trim()) return;
    runSave(async () => {
      await updateProfile({
        name: name.trim(),
        avatarColor: color,
        avatarUrl: avatarUrl ?? undefined,
      });
      onClose();
    });
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isBusy = saving || uploading;

  const formContent = (
    <div className="space-y-5 py-1">
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="relative group">
          <UserAvatar
            name={name}
            email={session?.user?.email}
            avatarColor={avatarUrl ? undefined : color}
            avatarUrl={avatarUrl}
            size="lg"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full",
              "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
              uploading && "opacity-100 cursor-wait",
            )}
            title="Ganti foto profil"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {avatarUrl && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
            Hapus foto
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="settings-name">Display name</Label>
        <Input
          id="settings-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Your name"
          maxLength={50}
          autoComplete="off"
        />
      </div>

      {!avatarUrl && (
        <div className="space-y-2">
          <Label>Avatar color</Label>
          <div className="flex flex-wrap gap-2.5">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => setColor(c.value)}
                className={cn(
                  "w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center shrink-0",
                  color === c.value &&
                    "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110",
                )}
                style={{ backgroundColor: c.value }}
              >
                {color === c.value && (
                  <Check className="w-3 h-3 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <ImageCropDialog
        src={cropSrc}
        onApply={handleCropApply}
        onCancel={() => setCropSrc(null)}
      />

      {isDesktop ? (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Profile settings</DialogTitle>
            </DialogHeader>

            {formContent}

            <DialogFooter showCloseButton>
              <Button onClick={handleSave} disabled={isBusy || !name.trim()}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Profile settings</DrawerTitle>
              <DrawerDescription>
                Update your display name, avatar color, or upload a photo.
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4">{formContent}</div>

            <DrawerFooter className="pt-4">
              <Button onClick={handleSave} disabled={isBusy || !name.trim()}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
