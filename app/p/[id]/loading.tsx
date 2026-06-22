import { Skeleton } from "@/components/ui/skeleton";

export default function PublicPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-10 h-11 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Skeleton className="h-7 w-24 rounded-md" />
      </header>

      {/* Content skeleton */}
      <main className="max-w-4xl mx-auto py-16 px-4 md:px-16 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-10 w-2/3" />
        </div>

        <div className="space-y-2.5 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <Skeleton className="h-6 w-1/3 mt-4" />

        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </main>
    </div>
  );
}
