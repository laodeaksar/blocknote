"use client";

import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
      <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50 mb-3 py-2.5">
        {syncError ? (
          <AlertCircle />
        ) : (
          <WifiOff />
        )}
        <AlertTitle>
          {syncError
            ? "Gagal menyinkronkan perubahan."
            : "Koneksi terputus. Mencoba menghubungkan kembali…"
          }
        </AlertTitle>
        {syncError?.message && (
          <AlertDescription>
            {syncError.message}
          </AlertDescription>
        )}
        <AlertAction>
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            size="xs"
          >
            <RefreshCw className={isRetrying ? "animate-spin" : ""} />
            {isRetrying ? "Memuat ulang…" : "Coba lagi"}
          </Button>
        </AlertAction>
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
