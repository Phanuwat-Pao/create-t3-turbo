"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { ResetPasswordForm } from "~/components/forms/reset-password-form";

export function ResetPasswordClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const handleSuccess = useCallback(() => {
    router.push("/sign-in");
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("auth.resetPassword.title")}</CardTitle>
          <CardDescription>
            {t("auth.resetPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
