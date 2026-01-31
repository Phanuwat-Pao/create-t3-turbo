import type { Metadata } from "next";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Card, CardContent } from "@acme/ui/card";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Building,
  Mail,
  User,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import type { Locale } from "~/i18n/i18n-config";

import { Logo } from "~/components/logo";
import { getDictionary } from "~/i18n/get-dictionary";
import { auth } from "~/lib/auth";

import { ConsentBtns } from "./_components/consent-buttons";

export const metadata: Metadata = {
  description: "Grant access to your account",
  title: "Authorize Application",
};

interface AuthorizePageProps {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{
    redirect_uri: string;
    scope: string;
    cancel_uri: string;
    client_id: string;
  }>;
}

export default async function AuthorizePage({
  params,
  searchParams,
}: AuthorizePageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { scope, client_id } = await searchParams;
  const _headers = await headers();
  const [session, clientDetails] = await Promise.all([
    auth.api.getSession({
      headers: _headers,
    }),
    auth.api.getOAuthClientPublic({
      headers: _headers,
      query: {
        client_id,
      },
    }),
  ]).catch((_error) => {
    throw redirect("/sign-in");
  });

  const organization = (
    session?.session as { activeOrganizationId?: string } | undefined
  )?.activeOrganizationId
    ? await auth.api.getFullOrganization({
        headers: _headers,
      })
    : undefined;

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">
        {dict.oauth.consent.title}
      </h1>
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4">
          <div className="mb-8 flex items-center gap-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border">
              {clientDetails.logo_uri ? (
                <Image
                  src={clientDetails.logo_uri}
                  alt={dict.oauth.consent.appLogoAlt}
                  className="object-cover"
                  width={64}
                  height={64}
                />
              ) : (
                <Logo />
              )}
            </div>
            <ArrowLeftRight className="h-6 w-6" />
            <div className="h-16 w-16 overflow-hidden rounded-full">
              <Avatar className="hidden h-16 w-16 sm:flex">
                <AvatarImage
                  src={session?.user.image || "#"}
                  alt="Avatar"
                  className="object-cover"
                />
                <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <h1 className="mb-8 text-center text-3xl font-semibold">
            {clientDetails.client_name} {dict.oauth.consent.requestingAccess}
          </h1>

          <Card className="w-full rounded-none border-zinc-800 bg-zinc-900">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                <div>
                  <div className="font-medium">{session?.user.name}</div>
                  <div className="text-zinc-400">{session?.user.email}</div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="mb-4 text-lg">
                  {dict.oauth.consent.continueAllow.replace(
                    "{{clientName}}",
                    clientDetails.client_name ?? ""
                  )}
                </div>
                {scope.includes("profile") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <User className="h-5 w-5" />
                    <span>{dict.oauth.consent.scopeUserData}</span>
                  </div>
                )}

                {scope.includes("email") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail className="h-5 w-5" />
                    <span>{dict.oauth.consent.scopeEmail}</span>
                  </div>
                )}

                {scope.includes("read:organization") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Building className="h-5 w-5" />
                    <span>
                      {dict.oauth.consent.scopeOrganization.replace(
                        "{{name}}",
                        organization?.name ?? ""
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <ConsentBtns dict={dict} />
          </Card>
        </div>
      </div>
    </div>
  );
}
