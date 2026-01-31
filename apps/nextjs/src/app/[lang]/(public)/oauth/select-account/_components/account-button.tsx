"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import type { Dictionary } from "~/i18n/get-dictionary";
import type { Session } from "~/lib/auth";

import { authClient } from "~/auth/client";

interface SelectAccountBtnProps {
  session: Partial<Session>;
  dict: Dictionary;
}

export function SelectAccountBtn({ session, dict }: SelectAccountBtnProps) {
  const handleClick = useCallback(async () => {
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
      if (error || !active?.session || !data.redirect || !data?.uri) {
        toast.error(
          error?.message ?? dict.oauth.selectAccount.failedToContinue
        );
        return;
      }
      window.location.href = data.uri;
    } catch (error) {
      toast.error(String(error));
    }
  }, [
    dict.oauth.selectAccount.failedToContinue,
    dict.oauth.selectAccount.failedToSetActive,
    dict.oauth.selectAccount.noSession,
    session.session?.token,
  ]);

  return (
    <Button
      className="h-12 w-full gap-2"
      variant="outline"
      onClick={handleClick}
    >
      <Avatar className="mr-2 h-5 w-5">
        <AvatarImage
          src={session.user?.image || undefined}
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

interface AnotherAccountBtnProps {
  dict: Dictionary;
}

export function AnotherAccountBtn({ dict }: AnotherAccountBtnProps) {
  const params = useSearchParams();
  return (
    <Link href={`/sign-in${params ? `?${params.toString()}` : ""}`}>
      <Button className="h-12 w-full gap-2" variant="outline">
        {dict.oauth.selectAccount.anotherAccount}
      </Button>
    </Link>
  );
}
