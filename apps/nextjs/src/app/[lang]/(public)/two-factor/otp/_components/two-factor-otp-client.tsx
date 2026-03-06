"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { TwoFactorEmailOtpForm } from "~/components/forms/two-factor-email-otp-form";
import type { Dictionary } from "~/i18n/get-dictionary";

interface TwoFactorOtpClientProps {
  dict: Dictionary;
}

export function TwoFactorOtpClient({ dict }: TwoFactorOtpClientProps) {
  const router = useRouter();
  const handleSuccess = useCallback(() => router.push("/dashboard"), [router]);

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{dict.auth.twoFactor.otpTitle}</CardTitle>
          <CardDescription>
            {dict.auth.twoFactor.otpDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorEmailOtpForm onSuccess={handleSuccess} dict={dict} />
        </CardContent>
      </Card>
    </main>
  );
}
