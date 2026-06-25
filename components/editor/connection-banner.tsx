"use client";

import { AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";

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
            size="icon-xs"
          >
            <RefreshCw className={isRetrying ? "animate-spin" : ""} />
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  if (isDisconnected) {
    return (
      <Alert className="mb-3 py-2.5">
        <Spinner />
        <AlertTitle>
          Menghubungkan ke server…
        </AlertTitle>
      </Alert>
    );
  }

  return null;
}
