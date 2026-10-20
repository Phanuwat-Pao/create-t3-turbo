"use client";

import { Tabs } from "@acme/ui/tabs2";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";
import { withLocale } from "~/i18n/localized-path";
import { useLocale } from "~/i18n/use-locale";
import { getCallbackURL } from "~/lib/shared";

import SignIn from "./sign-in";
import { SignUp } from "./sign-up";

export default function SignInPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();

  useEffect(() => {
    authClient.oneTap({
      fetchOptions: {
        onError: ({ error }: { error: { message?: string } }) => {
          toast.error(error.message || t("common.error"));
        },
        onSuccess: () => {
          toast.success(t("auth.signIn.successMessage"));
          router.push(withLocale(getCallbackURL(params), locale));
        },
      },
    });
  }, [locale, router, params, t]);

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="w-full max-w-md">
          <Tabs
            tabs={[
              {
                content: <SignIn />,
                title: t("auth.signIn.title"),
                value: "sign-in",
              },
              {
                content: <SignUp />,
                title: t("auth.signUp.title"),
                value: "sign-up",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
