import type { Metadata } from "next";

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

import { Logo } from "~/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Card, CardContent } from "@acme/ui/card";
import { auth } from "~/lib/auth";

import { ConsentBtns } from "./consent-buttons";

export const metadata: Metadata = {
  description: "Grant access to your account",
  title: "Authorize Application",
};

interface AuthorizePageProps {
  searchParams: Promise<{
    redirect_uri: string;
    scope: string;
    cancel_uri: string;
    client_id: string;
  }>;
}

export default async function AuthorizePage({
  searchParams,
}: AuthorizePageProps) {
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
  ]).catch((error) => {
    throw redirect("/sign-in");
  });

  const organization = session?.session?.activeOrganizationId
    ? await auth.api.getFullOrganization({
        headers: _headers,
      })
    : undefined;

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Authorize Application
      </h1>
      <div className="flex min-h-screen flex-col bg-black text-white">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4">
          <div className="mb-8 flex items-center gap-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border">
              {clientDetails.logo_uri ? (
                <Image
                  src={clientDetails.logo_uri}
                  alt="App Logo"
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
            {clientDetails.client_name} is requesting access to your Better Auth
            account
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
                  Continuing will allow Sign in with {clientDetails.client_name}{" "}
                  to:
                </div>
                {scope.includes("profile") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <User className="h-5 w-5" />
                    <span>Read your Better Auth user data.</span>
                  </div>
                )}

                {scope.includes("email") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail className="h-5 w-5" />
                    <span>Read your email address.</span>
                  </div>
                )}

                {scope.includes("read:organization") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Building className="h-5 w-5" />
                    <span>
                      Read your organization {organization?.name ?? ""}.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <ConsentBtns />
          </Card>
        </div>
      </div>
    </div>
  );
}
