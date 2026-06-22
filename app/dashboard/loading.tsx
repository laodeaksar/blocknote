import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border px-2 py-3 gap-1">
        {/* Workspace header */}
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-1 px-2 mb-2">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>

        {/* Nav items */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="size-4 rounded shrink-0" />
            <Skeleton className="h-4 flex-1" style={{ width: `${60 + (i % 3) * 15}%` }} />
          </div>
        ))}

        <div className="mt-3 border-t border-border pt-3 space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5">
              <Skeleton className="size-4 rounded shrink-0" />
              <Skeleton className="h-4" style={{ width: `${50 + i * 10}%` }} />
            </div>
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="size-16 rounded-xl" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </main>
    </div>
  );
}
