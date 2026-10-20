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
import { useTranslation } from "react-i18next";

import { TwoFactorEmailOtpForm } from "~/components/forms/two-factor-email-otp-form";
import { withLocale } from "~/i18n/localized-path";
import { useLocale } from "~/i18n/use-locale";

export function TwoFactorOtpClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const handleSuccess = useCallback(
    () => router.push(withLocale("/dashboard", locale)),
    [locale, router]
  );

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("auth.twoFactor.otpTitle")}</CardTitle>
          <CardDescription>
            {t("auth.twoFactor.otpDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorEmailOtpForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </main>
  );
}
