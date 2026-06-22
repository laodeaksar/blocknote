"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorScreen } from "@/components/ui/error-screen";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  const router = useRouter();

  return (
    <ErrorScreen
      icon={TriangleAlert}
      title="Terjadi kesalahan"
      description="Sesuatu tidak berjalan dengan benar. Coba muat ulang halaman."
    >
      <div className="flex gap-2">
        <Button size="sm" onClick={reset}>
          Muat ulang
        </Button>
        <Button size="sm" variant="outline" onClick={() => router.push("/")}>
          Ke beranda
        </Button>
      </div>
    </ErrorScreen>
  );
}
