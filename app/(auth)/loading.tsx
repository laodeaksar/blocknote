import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-xl border border-border shadow-sm p-8 space-y-6">
          {/* Logo + app name */}
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-28" />
          </div>

          {/* Title + subtitle */}
          <div className="space-y-2 text-center">
            <Skeleton className="h-6 w-36 mx-auto" />
            <Skeleton className="h-4 w-44 mx-auto" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-9 w-full rounded-lg mt-2" />
          </div>

          {/* Footer link */}
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
