import { Skeleton } from "@/components/ui/skeleton";

export default function DocLoading() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Navbar skeleton */}
      <div className="h-11 border-b border-border flex items-center px-4 gap-2 shrink-0">
        <Skeleton className="h-5 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>

      {/* Editor skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 md:py-16 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-9 w-2/3" />
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
        </div>
      </div>
    </div>
  );
}
