"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

import { ResetPasswordForm } from "~/components/forms/reset-password-form";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Enter new password and confirm it to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm
            token={token}
            onSuccess={() => router.push("/sign-in")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
