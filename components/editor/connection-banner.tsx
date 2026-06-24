"use client";

import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ConnectionBannerProps {
  syncError: Error | null;
  isReconnecting: boolean;
  isDisconnected: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

export function ConnectionBanner({
  syncError,
  isReconnecting,
  isDisconnected,
  isRetrying,
  onRetry,
}: ConnectionBannerProps) {
  if (!syncError && !isReconnecting && !isDisconnected) return null;

  if (syncError || isReconnecting) {
    return (
      <div
        className={`mb-3 flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm ${
          syncError
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-amber-50 border border-amber-200 text-amber-700"
        }`}
      >
        <span className="flex items-center gap-2">
          {syncError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <WifiOff className="w-4 h-4 shrink-0" />
          )}
          {syncError
            ? "Gagal menyinkronkan perubahan."
            : "Koneksi terputus. Mencoba menghubungkan kembali…"}
        </span>
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          size="sm"
          variant="ghost"
          className={
            syncError
              ? "bg-red-100 hover:bg-red-200 text-red-700"
              : "bg-amber-100 hover:bg-amber-200 text-amber-700"
          }
        >
          <RefreshCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Memuat ulang…" : "Coba lagi"}
        </Button>
      </div>
    );
  }

  if (isDisconnected) {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-muted border-border text-muted-foreground">
        <Spinner className="size-4" data-icon="inline-start" />
        Menghubungkan ke server…
      </div>
    );
  }

  return null;
}
