import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type ItemSize = "default" | "sm" | "xs";

const ItemContext = React.createContext<{ size: ItemSize }>({ size: "default" });

function useItemSize() {
  return React.useContext(ItemContext).size;
}

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
  "flex w-full flex-wrap items-center rounded-md transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-default select-none",
  {
    variants: {
      variant: {
        default: "hover:bg-muted",
        outline: "border border-border hover:bg-muted",
        muted: "bg-muted/30 hover:bg-muted/60",
      },
      size: {
        default: "px-2 py-1.5 gap-2 text-sm",
        sm: "px-2 py-1 gap-1.5 text-xs",
        xs: "px-1.5 py-0.5 gap-1 text-xs",
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
    <ItemContext.Provider value={{ size: size ?? "default" }}>
      <div
        data-slot="item"
        className={cn(itemVariants({ variant, size, className }))}
        {...props}
      />
    </ItemContext.Provider>
  );
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "[&_svg]:size-4",
        icon: "rounded-md [&_svg]:size-4",
        image: "overflow-hidden rounded-md [&_img]:h-full [&_img]:w-full [&_img]:object-cover",
      },
      size: {
        default: "size-7",
        sm: "size-5",
        xs: "size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function ItemMedia({
  className,
  variant,
  size: sizeProp,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  const contextSize = useItemSize();
  const size = sizeProp ?? contextSize;
  return (
    <div
      data-slot="item-media"
      className={cn(itemMediaVariants({ variant, size }), className)}
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

const itemTitleVariants = cva(
  "line-clamp-1 flex w-fit items-center font-medium text-foreground",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
        xs: "text-xs",
      },
    },
    defaultVariants: { size: "default" },
  }
);

function ItemTitle({
  className,
  size: sizeProp,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemTitleVariants>) {
  const contextSize = useItemSize();
  const size = sizeProp ?? contextSize;
  return (
    <div
      data-slot="item-title"
      className={cn(itemTitleVariants({ size }), className)}
      {...props}
    />
  );
}

const itemDescriptionVariants = cva(
  "line-clamp-2 text-muted-foreground",
  {
    variants: {
      size: {
        default: "text-xs",
        sm: "text-xxs",
        xs: "text-xxs",
      },
    },
    defaultVariants: { size: "default" },
  }
);

function ItemDescription({
  className,
  size: sizeProp,
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof itemDescriptionVariants>) {
  const contextSize = useItemSize();
  const size = sizeProp ?? contextSize;
  return (
    <p
      data-slot="item-description"
      className={cn(itemDescriptionVariants({ size }), className)}
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
