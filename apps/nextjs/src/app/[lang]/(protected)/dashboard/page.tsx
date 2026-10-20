import type { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "~/auth/server";
import AccountSwitcher from "~/components/account-switch";
import type { SessionData } from "~/data/user/session-query";
import { localizedRedirect } from "~/i18n/server";
import { NOINDEX } from "~/lib/metadata";

import OrganizationCard from "./_components/organization-card";
import UserCard from "./_components/user-card";

export const metadata: Metadata = { robots: NOINDEX };

export default async function Page() {
  const requestHeaders = await headers();

  const session = (await auth.api.getSession({
    headers: requestHeaders,
  })) as SessionData | null;
  if (!session) {
    return localizedRedirect("/sign-in");
  }

  const [activeSessions, deviceSessions] = await Promise.all([
    auth.api.listSessions({
      headers: requestHeaders,
    }),
    auth.api.listDeviceSessions({
      headers: requestHeaders,
    }),
  ]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <AccountSwitcher
          deviceSessions={deviceSessions}
          initialSession={session}
        />
        <UserCard session={session} activeSessions={activeSessions} />
        <OrganizationCard session={session} />
      </div>
    </div>
  );
}
