"use client";

import { Button } from "@/components/ui/button";

interface ToolbarButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}

export function ToolbarButton({ children, active, onClick, title }: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }
    >
      {children}
    </Button>
  );
}
