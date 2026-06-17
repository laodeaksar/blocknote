"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserSettingsDialog } from "@/components/user-settings-dialog";

export function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const profile = useQuery(api.users.getMyProfile, session?.user ? {} : "skip");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const displayName = profile?.name ?? session?.user?.name ?? "";
  const avatarColor = profile?.avatarColor ?? null;

  const initials = displayName
    ? displayName.trim().split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "?";

  const avatarStyle = avatarColor
    ? { backgroundColor: avatarColor }
    : undefined;

  const fallbackClass = avatarColor
    ? "text-white text-xs font-semibold"
    : "bg-foreground text-background text-xs font-semibold";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={session?.user?.email ?? "Account"}
        >
          <Avatar size="sm">
            <AvatarFallback className={fallbackClass} style={avatarStyle}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end" sideOffset={6} className="w-56">
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <Avatar size="sm" className="shrink-0">
                <AvatarFallback className={fallbackClass} style={avatarStyle}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                {displayName && (
                  <p className="text-sm font-medium text-foreground truncate">
                    {displayName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
            Profile settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
