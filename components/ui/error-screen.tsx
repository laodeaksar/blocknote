"use client";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

interface ErrorScreenProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function ErrorScreen({
  icon,
  title,
  description,
  children,
}: ErrorScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Empty className="max-w-sm border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {children && <EmptyContent>{children}</EmptyContent>}
      </Empty>
    </div>
  );
}
