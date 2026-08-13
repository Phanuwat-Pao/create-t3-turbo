"use client";

import type { DeviceSession } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { toast } from "sonner";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";
import { getAvatarUrl } from "~/lib/avatar";

interface SelectAccountBtnProps {
  session: DeviceSession;
  dict: Dictionary;
}

export function SelectAccountBtn({ session, dict }: SelectAccountBtnProps) {
  // No manual useCallback: the React Compiler memoizes this itself and flags
  // manual memoization it cannot preserve (PreserveManualMemo).
  const handleClick = async () => {
    try {
      if (!session.session?.token) {
        toast.error(dict.oauth.selectAccount.noSession);
        return;
      }
      const { data: active, error: activeError } =
        await authClient.multiSession.setActive({
          sessionToken: session.session.token,
        });
      if (activeError || !active?.session) {
        toast.error(
          activeError?.message ?? dict.oauth.selectAccount.failedToSetActive
        );
        return;
      }
      const { data, error } = await authClient.oauth2.continue({
        selected: true,
      });
      if (error || !active?.session || !data.redirect || !data?.url) {
        toast.error(
          error?.message ?? dict.oauth.selectAccount.failedToContinue
        );
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <Button
      className="h-12 w-full gap-2"
      variant="outline"
      onClick={handleClick}
    >
      <Avatar className="mr-2 h-5 w-5">
        <AvatarImage
          src={session.user?.id ? getAvatarUrl(session.user.id) : undefined}
          alt={session.user?.name}
        />
        <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex w-full text-start">
        <div>
          <p>{session.user?.name}</p>
          <p className="text-xs">{session.user?.email}</p>
        </div>
      </div>
    </Button>
  );
}
