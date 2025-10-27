import { fetchQuery } from "convex/nextjs";

import { api } from "@acme/convex/_generated/api.js";

import type { ActiveOrganization, Session } from "~/auth/client";
import { getToken } from "~/auth/server";
import AccountSwitcher from "~/components/account-switch";
import { OrganizationCard } from "./organization-card";
import UserCard from "./user-card";

export default async function DashboardPage() {
  const token = await getToken();
  const [session, activeSessions, deviceSessions, organization] =
    await fetchQuery(api.auth.getDashboard, {}, { token });
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <AccountSwitcher
          sessions={JSON.parse(JSON.stringify(deviceSessions)) as Session[]}
        />
        <UserCard
          session={JSON.parse(JSON.stringify(session)) as Session}
          activeSessions={
            JSON.parse(JSON.stringify(activeSessions)) as Session["session"][]
          }
          // subscription={subscriptions.find(
          //   (sub) => sub.status === "active" || sub.status === "trialing",
          // )}
        />
        <OrganizationCard
          session={JSON.parse(JSON.stringify(session)) as Session}
          activeOrganization={
            JSON.parse(JSON.stringify(organization)) as ActiveOrganization
          }
        />
      </div>
    </div>
  );
}
