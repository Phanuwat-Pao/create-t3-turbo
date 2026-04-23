"use client";

import type { DeviceSession } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@acme/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { ChevronDown, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";

import { authClient } from "~/auth/client";
import { getQueryClient } from "~/data/query-client";
import { userKeys } from "~/data/user/keys";
import { type SessionData, useSessionQuery } from "~/data/user/session-query";
import type { Dictionary } from "~/i18n/get-dictionary";
import { getAvatarUrl } from "~/lib/avatar";

const noop = () => {
  /* intentionally empty */
};

interface AccountItemProps {
  user: DeviceSession["user"];
  sessionToken: string;
  onSelect: (token: string) => void;
}

const AccountItem = memo(function AccountItem({
  user,
  sessionToken,
  onSelect,
}: AccountItemProps) {
  const handleSelect = useCallback(() => {
    onSelect(sessionToken);
  }, [onSelect, sessionToken]);

  return (
    <CommandItem onSelect={handleSelect} className="text-sm">
      <Avatar className="mr-2 h-5 w-5">
        <AvatarImage src={getAvatarUrl(user.id)} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex w-full items-center justify-between">
        <div>
          <p>{user.name}</p>
          <p className="text-xs">({user.email})</p>
        </div>
      </div>
    </CommandItem>
  );
});

export default function AccountSwitcher({
  deviceSessions,
  initialSession,
  dict,
}: {
  deviceSessions: DeviceSession[];
  initialSession: SessionData;
  dict: Dictionary;
}) {
  const queryClient = getQueryClient();
  const { data: currentUser } = useSessionQuery(initialSession);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSwitchAccount = useCallback(
    async (sessionToken: string) => {
      try {
        await authClient.multiSession.setActive({
          sessionToken,
        });
        await queryClient.invalidateQueries({
          queryKey: userKeys.all(),
        });
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Failed to switch account:", error);
      }
    },
    [queryClient, router]
  );

  const handleAddAccount = useCallback(() => {
    router.push("/sign-in");
    setOpen(false);
  }, [router]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          aria-label={dict.accountSwitch.selectUser}
          className="w-[250px] justify-between"
        >
          <Avatar className="mr-2 h-6 w-6">
            <AvatarImage
              src={
                currentUser?.user.id
                  ? getAvatarUrl(currentUser.user.id)
                  : undefined
              }
              alt={currentUser?.user.name}
            />
            <AvatarFallback>{currentUser?.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {currentUser?.user.name}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandList>
            <CommandGroup heading={dict.accountSwitch.currentAccount}>
              <CommandItem
                onSelect={noop}
                className="w-full justify-between text-sm"
                key={currentUser?.user.id}
              >
                <div className="flex items-center">
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage
                      src={
                        currentUser?.user.id
                          ? getAvatarUrl(currentUser.user.id)
                          : undefined
                      }
                      alt={currentUser?.user.name}
                    />
                    <AvatarFallback>
                      {currentUser?.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {currentUser?.user.name}
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={dict.accountSwitch.switchAccount}>
              {deviceSessions
                .filter((s) => s.user.id !== currentUser?.user.id)
                .map((u) => (
                  <AccountItem
                    key={u.session.token}
                    user={u.user}
                    sessionToken={u.session.token}
                    onSelect={handleSwitchAccount}
                  />
                ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={handleAddAccount}
                className="cursor-pointer text-sm"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                {dict.accountSwitch.addAccount}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
