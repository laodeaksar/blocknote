"use client";

import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      <Alert variant="destructive" className="mb-3 flex items-center justify-between gap-3 py-2.5">
        {syncError ? (
          <AlertCircle className="size-4 shrink-0" />
        ) : (
          <WifiOff className="size-4 shrink-0" />
        )}
        <AlertDescription className="flex flex-1 items-center justify-between gap-3 text-destructive/90">
          <span>
            {syncError
              ? "Gagal menyinkronkan perubahan."
              : "Koneksi terputus. Mencoba menghubungkan kembali…"}
          </span>
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            size="sm"
            variant="ghost"
            className="shrink-0 bg-destructive/10 hover:bg-destructive/20 text-destructive"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Memuat ulang…" : "Coba lagi"}
          </Button>
        </AlertDescription>
      </Alert>
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
