import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-1", className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  "flex w-full flex-wrap items-center gap-2 rounded-md transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-default select-none",
  {
    variants: {
      variant: {
        default: "hover:bg-muted",
        outline: "border border-border hover:bg-muted",
        muted: "bg-muted/30 hover:bg-muted/60",
      },
      size: {
        default: "px-2 py-1.5 text-sm",
        sm: "px-2 py-1 text-xs",
        xs: "px-1.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Item({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
  return (
    <div
      data-slot="item"
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  );
}

function ItemMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-media"
      className={cn("flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:size-4", className)}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex flex-1 flex-col min-w-0", className)}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn("line-clamp-1 flex w-fit items-center text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function ItemDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn("line-clamp-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
};
