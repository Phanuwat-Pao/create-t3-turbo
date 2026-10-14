import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import type { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "~/auth/server";
import { getT } from "~/i18n/server";

import { SelectAccountBtn } from "./_components/account-button";
import { AnotherAccountBtn } from "./_components/another-account-button";

export const metadata: Metadata = {
  description: "Select account to authorize this application",
  robots: { follow: false, index: false },
  title: "Select Account",
};

export default async function SelectAccountPage() {
  const { t } = await getT();
  const sessions = await auth.api.listDeviceSessions({
    headers: await headers(),
  });
  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="md:w-[400px]">
          <Card className="w-full rounded-none border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                {t("oauth.selectAccount.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {sessions.map((s: (typeof sessions)[number]) => (
                <SelectAccountBtn key={s.session.id} session={s} />
              ))}
            </CardContent>
            <AnotherAccountBtn />
          </Card>
        </div>
      </div>
    </div>
  );
}
