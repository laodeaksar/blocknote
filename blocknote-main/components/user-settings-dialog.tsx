"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && profile !== undefined) {
      setName(profile?.name ?? session?.user?.name ?? "");
      setColor(profile?.avatarColor ?? DEFAULT_COLOR);
    }
  }, [open, profile, session?.user?.name]);

  const initials = name.trim()
    ? name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "?";

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), avatarColor: color });
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="flex justify-center pt-1">
            <Avatar size="lg">
              <AvatarFallback
                className="text-white text-base font-semibold"
                style={{ backgroundColor: color }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
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
                      "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
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
        </div>

        <DialogFooter showCloseButton>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
