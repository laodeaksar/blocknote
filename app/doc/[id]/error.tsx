"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorScreen } from "@/components/ui/error-screen";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

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
    <ErrorScreen
      icon={<TriangleAlert className="size-4 text-muted-foreground" />}
      title="Halaman gagal dimuat"
      description="Terjadi kesalahan saat memuat dokumen. Coba muat ulang."
    >
      <div className="flex gap-2">
        <Button size="sm" onClick={reset}>
          Muat ulang
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Kembali
        </Button>
      </div>
    </ErrorScreen>
  );
}
