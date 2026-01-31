"use client";

import { Tabs } from "@acme/ui/tabs2";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import type { Dictionary } from "~/i18n/get-dictionary";

import { authClient } from "~/auth/client";
import { getCallbackURL } from "~/lib/shared";

import SignIn from "./sign-in";
import { SignUp } from "./sign-up";

interface SignInPageProps {
  dict: Dictionary;
}

export default function SignInPage({ dict }: SignInPageProps) {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    authClient.oneTap({
      fetchOptions: {
        onError: ({ error }: { error: { message?: string } }) => {
          toast.error(error.message || dict.common.error);
        },
        onSuccess: () => {
          toast.success(dict.auth.signIn.successMessage);
          router.push(getCallbackURL(params));
        },
      },
    });
  }, [router, params, dict]);

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="w-full max-w-md">
          <Tabs
            tabs={[
              {
                content: <SignIn dict={dict} />,
                title: dict.auth.signIn.title,
                value: "sign-in",
              },
              {
                content: <SignUp dict={dict} />,
                title: dict.auth.signUp.title,
                value: "sign-up",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
