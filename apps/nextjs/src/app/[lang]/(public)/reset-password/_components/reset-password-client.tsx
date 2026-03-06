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

import { ResetPasswordForm } from "~/components/forms/reset-password-form";
import type { Dictionary } from "~/i18n/get-dictionary";

interface ResetPasswordClientProps {
  dict: Dictionary;
}

export function ResetPasswordClient({ dict }: ResetPasswordClientProps) {
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
          <CardTitle>{dict.auth.resetPassword.title}</CardTitle>
          <CardDescription>
            {dict.auth.resetPassword.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm
            token={token}
            onSuccess={handleSuccess}
            dict={dict}
          />
        </CardContent>
      </Card>
    </div>
  );
}
