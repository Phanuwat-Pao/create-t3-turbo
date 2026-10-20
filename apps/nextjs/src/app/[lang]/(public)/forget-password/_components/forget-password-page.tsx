"use client";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { ForgetPasswordForm } from "~/components/forms/forget-password-form";
import Link from "~/components/link";

export default function ForgetPasswordPage() {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSuccess = useCallback(() => setIsSubmitted(true), []);

  if (isSubmitted) {
    return (
      <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>{t("auth.forgotPassword.checkEmail")}</CardTitle>
            <CardDescription>
              {t("auth.forgotPassword.emailSentDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="default">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {t("auth.forgotPassword.checkSpam")}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/sign-in">
              <Button variant="link" className="gap-2 px-0">
                <ArrowLeft size={15} />
                {t("auth.forgotPassword.backToSignIn")}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("auth.forgotPassword.title")}</CardTitle>
          <CardDescription>
            {t("auth.forgotPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgetPasswordForm onSuccess={handleSuccess} />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/sign-in">
            <Button variant="link" className="gap-2 px-0">
              <ArrowLeft size={15} />
              {t("auth.forgotPassword.backToSignIn")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
