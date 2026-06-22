"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
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
    <div className="flex h-screen items-center justify-center bg-background">
      <Empty className="max-w-sm border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert className="size-4 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Terjadi kesalahan</EmptyTitle>
          <EmptyDescription>
            Sesuatu tidak berjalan dengan benar. Coba muat ulang halaman.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button size="sm" onClick={reset}>
              Muat ulang
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Ke beranda
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
