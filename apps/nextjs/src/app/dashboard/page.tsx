import { headers as NextHeaders } from "next/headers";

import { authClient } from "~/auth/client";
import AccountSwitcher from "~/components/account-switch";
import { OrganizationCard } from "./organization-card";
import UserCard from "./user-card";

export default async function DashboardPage() {
  const headers = await NextHeaders();
  const [session, activeSessions, deviceSessions, organization] =
    await Promise.all([
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
        <AccountSwitcher sessions={deviceSessions.data ?? []} />
        <UserCard
          session={session.data}
          activeSessions={activeSessions.data ?? []}
          // subscription={subscriptions.find(
          //   (sub) => sub.status === "active" || sub.status === "trialing",
          // )}
        />
        <OrganizationCard
          session={session.data}
          activeOrganization={organization.data}
        />
      </div>
    </div>
  );
}
