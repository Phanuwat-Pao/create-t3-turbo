import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { headers } from "next/headers";

import type { Locale } from "~/i18n/i18n-config";

import { getDictionary } from "~/i18n/get-dictionary";
import { auth } from "~/lib/auth";

import {
  AnotherAccountBtn,
  SelectAccountBtn,
} from "./_components/account-button";

export const metadata: Metadata = {
  description: "Select account to authorize this application",
  title: "Select Account",
};

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function SelectAccountPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
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
                {dict.oauth.selectAccount.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {sessions.map((s, i) => (
                <SelectAccountBtn
                  key={s.session.id ?? i}
                  session={s}
                  dict={dict}
                />
              ))}
            </CardContent>
            <AnotherAccountBtn dict={dict} />
          </Card>
        </div>
      </div>
    </div>
  );
}
