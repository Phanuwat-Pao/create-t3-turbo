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

export default function Page() {
  const router = useRouter();
  const handleSuccess = useCallback(() => router.push("/dashboard"), [router]);

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Verify your identity with a one-time password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorEmailOtpForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </main>
  );
}
