"use client";

import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}

export function ToolbarButton({ children, active, onClick, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex items-center justify-center size-7 rounded-md text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </button>
  );
}
