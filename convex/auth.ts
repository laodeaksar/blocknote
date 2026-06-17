import { components } from "./_generated/api";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { type DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel>(components.betterAuth);

function getBaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return undefined;
  return url.replace(/\/$/, "");
}

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  const baseUrl = getBaseUrl();

  return betterAuth({
    ...(baseUrl ? { baseURL: baseUrl } : {}),
    trustedOrigins: async (request) => {
      const origins: string[] = [
        "https://*.replit.dev",
        "https://*.replit.app",
        "https://*.sisko.replit.dev",
        "https://*.pike.replit.dev",
      ];

      if (baseUrl) origins.push(baseUrl);

      const forwardedHost = request?.headers.get("x-better-auth-forwarded-host");
      const forwardedProto = request?.headers.get("x-better-auth-forwarded-proto") ?? "https";
      if (forwardedHost) {
        origins.push(`${forwardedProto}://${forwardedHost}`);
      }

      return origins;
    },
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      convex({ authConfig }),
    ],
  } satisfies BetterAuthOptions);
};

export const { getAuthUser } = authComponent.clientApi();
