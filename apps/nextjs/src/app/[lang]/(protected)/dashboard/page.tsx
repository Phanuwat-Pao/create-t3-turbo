import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/auth/server";
import AccountSwitcher from "~/components/account-switch";
import { getDictionary } from "~/i18n/get-dictionary";
import type { Locale } from "~/i18n/i18n-config";

import OrganizationCard from "./_components/organization-card";
import UserCard from "./_components/user-card";

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session) {
    redirect("/sign-in");
  }

  const [activeSessions, deviceSessions, dict] = await Promise.all([
    auth.api.listSessions({
      headers: requestHeaders,
    }),
    auth.api.listDeviceSessions({
      headers: requestHeaders,
    }),
    getDictionary(lang),
  ]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <AccountSwitcher
          deviceSessions={deviceSessions}
          initialSession={session}
          dict={dict}
        />
        <UserCard
          session={session}
          activeSessions={activeSessions}
          dict={dict}
        />
        <OrganizationCard session={session} dict={dict} />
      </div>
    </div>
  );
}
