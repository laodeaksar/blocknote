"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "./auth-client";

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          background: "#f9f9f9",
          color: "#333",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            padding: "2rem",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 600 }}>
            Convex belum dikonfigurasi
          </h2>
          <p style={{ margin: "0 0 16px", color: "#6b7280", lineHeight: 1.6 }}>
            Tambahkan secret <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_CONVEX_URL</code> di tab{" "}
            <strong>Secrets</strong> pada panel kiri Replit, lalu restart
            workflow.
          </p>
          <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>
            URL bisa ditemukan di Convex Dashboard → Settings → URL &amp; Deploy Key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexBetterAuthProvider>
  );
}
