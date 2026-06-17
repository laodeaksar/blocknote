"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

type Theme = "light" | "dark" | "system";

const CYCLE: Theme[] = ["light", "dark", "system"];

function nextTheme(current: string): Theme {
  const idx = CYCLE.indexOf(current as Theme);
  return CYCLE[(idx === -1 ? 0 : idx + 1) % CYCLE.length];
}

export function ThemeShortcut() {
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const savedTheme = useQuery(api.users.getMyTheme, isLoggedIn ? {} : "skip");
  const saveTheme = useMutation(api.users.setMyTheme);
  const hasApplied = useRef(false);

  useEffect(() => {
    if (savedTheme && !hasApplied.current) {
      hasApplied.current = true;
      setTheme(savedTheme);
    }
  }, [savedTheme, setTheme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        const next = nextTheme(theme ?? "system");
        setTheme(next);
        if (isLoggedIn) saveTheme({ theme: next }).catch(() => {});
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [theme, setTheme, isLoggedIn, saveTheme]);

  return null;
}
