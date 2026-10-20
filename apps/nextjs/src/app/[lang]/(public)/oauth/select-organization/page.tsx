import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import type { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "~/auth/server";
import Link from "~/components/link";
import { getT } from "~/i18n/server";

import { GoBackBtn } from "./_components/go-back-button";
import { SelectOrganizationBtn } from "./_components/org-buttons";

export const metadata: Metadata = {
  description: "Specify which organization to authorize to this application",
  robots: { follow: false, index: false },
  title: "Select Organization",
};

export default async function SelectOrganizationPage() {
  const { t } = await getT();
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
                {t("oauth.selectOrganization.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {organizations.length ? (
                organizations.map((o: (typeof organizations)[number]) => (
                  <SelectOrganizationBtn key={o.id} organization={o} />
                ))
              ) : (
                <div>
                  <p>{t("oauth.selectOrganization.noOrganizations")}</p>
                  <br />
                  <div className="flex flex-col gap-1">
                    <Link href="/dashboard">
                      <Button className="w-full">
                        {t("oauth.selectOrganization.createOrganization")}
                      </Button>
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
