import { cookies } from "next/headers";

import { authClient } from "~/auth/client";
import AccountSwitcher from "~/components/account-switch";
import { OrganizationCard } from "./organization-card";
import UserCard from "./user-card";

export default async function DashboardPage() {
  const headers = { cookie: (await cookies()).toString() };

  const [
    { data: session },
    { data: activeSessions },
    { data: deviceSessions },
    { data: organization },
  ] = await Promise.all([
    authClient.getSession({ fetchOptions: { headers } }),
    authClient.listSessions({ fetchOptions: { headers } }),
    authClient.multiSession.listDeviceSessions({ fetchOptions: { headers } }),
    authClient.organization.getFullOrganization({
      fetchOptions: { headers },
    }),
  ]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <AccountSwitcher sessions={deviceSessions ?? []} />
        <UserCard
          session={session}
          activeSessions={activeSessions ?? []}
          // subscription={subscriptions.find(
          //   (sub) => sub.status === "active" || sub.status === "trialing",
          // )}
        />
        <OrganizationCard session={session} activeOrganization={organization} />
      </div>
    </div>
  );
}
