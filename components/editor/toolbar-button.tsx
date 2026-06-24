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
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </Button>
  );
}
