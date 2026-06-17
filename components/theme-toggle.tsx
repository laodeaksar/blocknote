"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

type Theme = "light" | "dark" | "system";

const CYCLE: Theme[] = ["light", "dark", "system"];

const LABELS: Record<Theme, string> = {
  light:  "Light mode — click for dark (Ctrl+Shift+L)",
  dark:   "Dark mode — click for system (Ctrl+Shift+L)",
  system: "System mode — click for light (Ctrl+Shift+L)",
};

function nextTheme(current: Theme): Theme {
  return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "dark")   return <Moon    className="w-4 h-4" />;
  if (theme === "system") return <Monitor className="w-4 h-4" />;
  return                         <Sun     className="w-4 h-4" />;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const saveTheme = useMutation(api.users.setMyTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-background" />;
  }

  const current = (theme as Theme) ?? "system";
  const next = nextTheme(current);
  const label = LABELS[current];

  const toggle = () => {
    setTheme(next);
    if (session?.user) saveTheme({ theme: next }).catch(() => {});
  };

  return (
    <Button
      onClick={toggle}
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
    >
      <ThemeIcon theme={current} />
    </Button>
  );
}
