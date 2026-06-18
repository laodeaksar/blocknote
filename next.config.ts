import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    resolveAlias: {
      "@tiptap/core":
        "./node_modules/.pnpm/@tiptap+core@3.27.0_@tiptap+pm@3.27.0/node_modules/@tiptap/core",
    },
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [
      {
        source: "/((?!api/).*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
        ],
      },
    ];
  },
};

export default nextConfig;
