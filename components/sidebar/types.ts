import type { Id } from "@/convex/_generated/dataModel";

export type PageData = {
  _id: Id<"pages">;
  title: string;
  icon?: string;
  isArchived: boolean;
  isPublished: boolean;
};
