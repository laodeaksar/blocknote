"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { LogOut, Settings } from "lucide-react";
import { UserAvatar } from "@components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserSettingsDialog } from "@/components/user-settings-dialog";

export function NavUser() {
  const { isMobile } = useSidebar()
  
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
            name={displayName}
            email={email}
            avatarColor={avatarUrl ? undefined : avatarColor}
            avatarUrl={avatarUrl}
            className="rounded-lg grayscale"
          />
              <div className="grid flex-1 text-left text-sm leading-tight">
                {displayName && (
                <span className="truncate font-medium">{displayName}</span>)}
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              {/*<IconDotsVertical className="ml-auto size-4" />*/}
            </SidebarMenuButton>}
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                 <UserAvatar
            name={displayName}
            email={email}
            avatarColor={avatarUrl ? undefined : avatarColor}
            avatarUrl={avatarUrl}
            className="rounded-lg"
          />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {displayName && (
                  <span className="truncate font-medium">{displayName}</span>
                  
                  )}
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="size-4" data-icon="inline-start" />
            Profile settings
          </DropdownMenuItem>
              <DropdownMenuItem>
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="size-4" data-icon="inline-start" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
      <UserSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      </>
  )
}