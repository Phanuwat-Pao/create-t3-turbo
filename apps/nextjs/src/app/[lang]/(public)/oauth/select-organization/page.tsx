import type { Metadata } from "next";

import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { headers } from "next/headers";
import Link from "next/link";

import type { Locale } from "~/i18n/i18n-config";

import { auth } from "~/auth/server";
import { getDictionary } from "~/i18n/get-dictionary";

import { GoBackBtn } from "./_components/go-back-button";
import { SelectOrganizationBtn } from "./_components/org-buttons";

export const metadata: Metadata = {
  description: "Specify which organization to authorize to this application",
  title: "Select Organization",
};

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function SelectOrganizationPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
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
                {dict.oauth.selectOrganization.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {organizations.length ? (
                organizations.map((o) => (
                  <SelectOrganizationBtn
                    key={o.id}
                    organization={o}
                    dict={dict}
                  />
                ))
              ) : (
                <div>
                  <p>{dict.oauth.selectOrganization.noOrganizations}</p>
                  <br />
                  <div className="flex flex-col gap-1">
                    <Link href="/dashboard">
                      <Button className="w-full">
                        {dict.oauth.selectOrganization.createOrganization}
                      </Button>
                    </Link>
                    <GoBackBtn dict={dict} />
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
