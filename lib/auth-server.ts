import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { NextResponse } from "next/server";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexSiteUrl = process.env.CONVEX_SITE_URL;

function notConfiguredHandler() {
  const res = NextResponse.json({ error: "Convex not configured" }, { status: 503 });
  return res;
}

let _auth: ReturnType<typeof convexBetterAuthNextJs> | null = null;

function getAuth() {
  if (!convexUrl || !convexSiteUrl) return null;
  if (!_auth) {
    _auth = convexBetterAuthNextJs({ convexUrl, convexSiteUrl });
  }
  return _auth;
}

export const getToken = async (...args: Parameters<ReturnType<typeof convexBetterAuthNextJs>["getToken"]>) => {
  const auth = getAuth();
  if (!auth) return null;
  return auth.getToken(...args);
};

export const isAuthenticated = async (...args: Parameters<ReturnType<typeof convexBetterAuthNextJs>["isAuthenticated"]>) => {
  const auth = getAuth();
  if (!auth) return false;
  return auth.isAuthenticated(...args);
};

export const fetchAuthQuery = async (...args: Parameters<ReturnType<typeof convexBetterAuthNextJs>["fetchAuthQuery"]>) => {
  const auth = getAuth();
  if (!auth) return null;
  const fn = auth.fetchAuthQuery as (...a: typeof args) => unknown;
  return fn(...args);
};

export const handler = {
  GET: (req: Request) => {
    const auth = getAuth();
    if (!auth) return notConfiguredHandler();
    return auth.handler.GET(req as Parameters<typeof auth.handler.GET>[0]);
  },
  POST: (req: Request) => {
    const auth = getAuth();
    if (!auth) return notConfiguredHandler();
    return auth.handler.POST(req as Parameters<typeof auth.handler.POST>[0]);
  },
};
