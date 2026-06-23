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
import { UserAvatar } from "@/components/ui/avatar";
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
  const email = session?.user?.email ?? "";
  const avatarColor = profile?.avatarColor ?? null;
  const avatarUrl = profile?.avatarUrl ?? null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={email || "Account"}
        >
          <UserAvatar
            name={displayName}
            email={email}
            avatarColor={avatarUrl ? undefined : avatarColor}
            avatarUrl={avatarUrl}
            size="sm"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end" sideOffset={6} className="w-56">
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <UserAvatar
                name={displayName}
                email={email}
                avatarColor={avatarUrl ? undefined : avatarColor}
                avatarUrl={avatarUrl}
                size="sm"
              />
              <div className="min-w-0">
                {displayName && (
                  <p className="text-sm font-medium text-foreground truncate">
                    {displayName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="size-4" />
            Profile settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
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
