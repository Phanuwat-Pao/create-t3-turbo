"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { SignUpForm } from "~/components/forms/sign-up-form";
import { getCallbackURL } from "~/lib/shared";

export function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const callbackURL = getCallbackURL(params);

  const handleSuccess = useCallback(() => {
    router.push(callbackURL);
  }, [router, callbackURL]);

  return (
    <Card className="w-full rounded-md rounded-t-none">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          {t("auth.signUp.title")}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("auth.signUp.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm onSuccess={handleSuccess} callbackURL={callbackURL} />
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-center border-t pt-4">
          <p className="text-center text-xs text-neutral-500">
            {t("auth.signUp.builtWith")}{" "}
            <Link
              href="https://better-auth.com"
              className="underline"
              target="_blank"
            >
              <span className="cursor-pointer dark:text-white/70">
                better-auth.
              </span>
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
