import { useState, useEffect, useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import { useConvexConnectionState } from "convex/react";

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "Baru saja disimpan";
  if (seconds < 60) return `Disimpan ${seconds} dtk lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Disimpan ${minutes} mnt lalu`;
  return `Disimpan ${Math.floor(minutes / 60)} jam lalu`;
}

type SaveStatus = "idle" | "saving" | "saved";

export function NavbarStatus() {
  const connectionState = useConvexConnectionState();
  const [saveStatus, setSaveStatus] = useState < SaveStatus > ("idle");
  const [lastSavedAt, setLastSavedAt] = useState < Date | null > (null);
  const [, setTick] = useState(0);
  const prevRef = useRef(connectionState.hasInflightRequests);
  const hasEverSavedRef = useRef(false);
  
  useEffect(() => {
    const was = prevRef.current;
    const is = connectionState.hasInflightRequests;
    if (is && !was) {
      hasEverSavedRef.current = true;
      setSaveStatus("saving");
    } else if (!is && was && hasEverSavedRef.current) {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    }
    prevRef.current = is;
  }, [connectionState.hasInflightRequests]);
  
  useEffect(() => {
    if (saveStatus !== "saved") return;
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(id);
  }, [saveStatus]);
  
  if (saveStatus === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin shrink-0" />
        <span className="hidden sm:inline">Menyimpan…</span>
      </span>
    );
  }
  if (saveStatus === "saved" && lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3 text-success shrink-0" />
        <span className="hidden sm:inline">{formatRelativeTime(lastSavedAt)}</span>
      </span>
    );
  }
  return null;
}