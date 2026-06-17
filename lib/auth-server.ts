import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const { getToken, handler, isAuthenticated, fetchAuthQuery } =
  convexBetterAuthNextJs({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    convexSiteUrl: process.env.CONVEX_SITE_URL!,
  });
