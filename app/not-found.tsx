import Link from "next/link";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Empty className="max-w-sm border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion className="size-4 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Halaman tidak ditemukan</EmptyTitle>
          <EmptyDescription>
            Halaman yang kamu cari tidak ada atau sudah dihapus.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" render={
            <Link href="/">Ke beranda</Link>}
          />
        </EmptyContent>
      </Empty>
    </div>
  );
}
