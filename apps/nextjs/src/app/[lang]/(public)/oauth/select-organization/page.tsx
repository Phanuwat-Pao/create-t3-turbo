import type { Metadata } from "next";

import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "~/lib/auth";

import { GoBackBtn, SelectOrganizationBtn } from "./org-buttons";

export const metadata: Metadata = {
  description: "Specify which organization to authorize to this application",
  title: "Select Organization",
};

export default async function SelectOrganizationPage() {
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });
  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="md:w-[400px]">
          <Card className="w-full rounded-none border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Select Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {organizations.length ? (
                organizations.map((o, i) => (
                  <SelectOrganizationBtn key={o.id ?? i} organization={o} />
                ))
              ) : (
                <div>
                  <p>
                    Application is requesting scopes for an organization but no
                    organizations exist for this account.
                  </p>
                  <br />
                  <div className="flex flex-col gap-1">
                    <Link href="/dashboard">
                      <Button className="w-full">Create Organization</Button>
                    </Link>
                    <GoBackBtn />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
