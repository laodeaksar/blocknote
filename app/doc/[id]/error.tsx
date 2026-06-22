"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DocError]", error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm px-6">
        <div className="size-12 bg-muted rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Halaman gagal dimuat
        </h2>
        <p className="text-sm text-muted-foreground">
          Terjadi kesalahan saat memuat dokumen. Coba muat ulang.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Muat ulang
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
