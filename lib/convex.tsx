"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "./auth-client";
import { ErrorScreen } from "@/components/ui/error-screen";
import { Settings } from "lucide-react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

let convex: ConvexReactClient | null = null;
let convexQueryClient: ConvexQueryClient | null = null;
let queryClient: QueryClient | null = null;

if (convexUrl) {
  convex = new ConvexReactClient(convexUrl);
  convexQueryClient = new ConvexQueryClient(convex);
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!convexUrl || !convex || !queryClient) {
    return (
      <ErrorScreen
        icon={Settings}
        title="Convex belum dikonfigurasi"
        description="Tambahkan secret NEXT_PUBLIC_CONVEX_URL di tab Secrets pada panel kiri Replit, lalu restart workflow. URL bisa ditemukan di Convex Dashboard → Settings → URL & Deploy Key."
      />
    );
  }

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient as unknown as Parameters<typeof ConvexBetterAuthProvider>[0]["authClient"]}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexBetterAuthProvider>
  );
}
