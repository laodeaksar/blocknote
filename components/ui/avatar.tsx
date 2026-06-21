"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cn } from "@/lib/utils";
import { getDisplayInitials, getAvatarColor } from "@/lib/initials";

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & { size?: "sm" | "default" | "lg" }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative flex shrink-0 select-none overflow-hidden rounded-full",
        size === "sm" && "size-6",
        size === "default" && "size-8",
        size === "lg" && "size-12",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted/40 text-sm font-medium text-foreground",
        className
      )}
      {...props}
    />
  );
}

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  avatarColor?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}

function UserAvatar({
  name,
  email,
  avatarColor,
  avatarUrl,
  size = "default",
  className,
}: UserAvatarProps) {
  const initials = getDisplayInitials(name, email);
  const color = avatarColor ?? getAvatarColor(name ?? email ?? "?");

  return (
    <Avatar size={size} className={className}>
      {avatarUrl && (
        <AvatarImage src={avatarUrl} alt={name ?? email ?? ""} />
      )}
      <AvatarFallback
        className="text-white font-semibold"
        style={{ backgroundColor: color }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar };
