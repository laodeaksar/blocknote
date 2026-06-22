"use client";

import Link from "next/link";
import { ErrorScreen } from "@/components/ui/error-screen";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <ErrorScreen
      icon={<FileQuestion className="size-4 text-muted-foreground" />}
      title="Halaman tidak ditemukan"
      description="Halaman yang kamu cari tidak ada atau sudah dihapus."
    >
      <Button size="sm" render={<Link href="/">Ke beranda</Link>} />
    </ErrorScreen>
  );
}
