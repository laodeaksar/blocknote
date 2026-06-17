import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {},
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
