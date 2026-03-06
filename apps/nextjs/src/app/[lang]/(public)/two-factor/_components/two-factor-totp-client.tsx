"use client";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { TwoFactorTotpForm } from "~/components/forms/two-factor-totp-form";
import type { Dictionary } from "~/i18n/get-dictionary";

interface TwoFactorTotpClientProps {
  dict: Dictionary;
}

export function TwoFactorTotpClient({ dict }: TwoFactorTotpClientProps) {
  const router = useRouter();
  const handleSuccess = useCallback(() => router.push("/dashboard"), [router]);

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{dict.auth.twoFactor.title}</CardTitle>
          <CardDescription>{dict.auth.twoFactor.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorTotpForm onSuccess={handleSuccess} dict={dict} />
        </CardContent>
        <CardFooter className="text-muted-foreground gap-2 text-sm">
          <Link href="/two-factor/otp">
            <Button variant="link" size="sm">
              {dict.auth.twoFactor.switchToEmail}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
