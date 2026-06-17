"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "./auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});
convexQueryClient.connect(queryClient);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexBetterAuthProvider>
  );
}
