"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";

interface LoadingButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  isPending?: boolean;
  loadingText?: string;
}

function LoadingButton({
  isPending = false,
  loadingText,
  children,
  disabled,
  className,
  variant,
  size,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isPending}
      className={cn(className)}
      {...props}
    >
      {isPending && (
        <Spinner data-icon="inline-start" />
      )}
      {isPending && loadingText !== undefined ? loadingText : children}
    </Button>
  );
}

export { LoadingButton };
export type { LoadingButtonProps };
