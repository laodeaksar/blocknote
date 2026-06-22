import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  label?: string;
  className?: string;
}

export function LoadingScreen({ label, className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground",
        className
      )}
    >
      <Spinner className="size-5" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
