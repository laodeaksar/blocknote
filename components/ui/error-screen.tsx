"use client";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import type { LucideIcon } from "lucide-react";

interface ErrorScreenProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function ErrorScreen({
  icon: Icon,
  title,
  description,
  children,
}: ErrorScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Empty className="max-w-sm border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon className="size-4 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {children && <EmptyContent>{children}</EmptyContent>}
      </Empty>
    </div>
  );
}
