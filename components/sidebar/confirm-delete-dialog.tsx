"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function ConfirmDeleteDialog({
  page,
  onClose,
  onConfirm,
  isPending,
}: {
  page: { id: Id<"pages">; title: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={!!page} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus permanen?</DialogTitle>
          <DialogDescription>
            <strong>&ldquo;{page?.title || "Untitled"}&rdquo;</strong> akan
            dihapus selamanya dan tidak bisa dikembalikan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={onConfirm}
            isPending={isPending}
            loadingText="Menghapus..."
          >
            Hapus
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
