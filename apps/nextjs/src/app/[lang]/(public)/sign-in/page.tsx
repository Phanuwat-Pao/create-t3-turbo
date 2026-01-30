"use client";

import { Tabs } from "@acme/ui/tabs2";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { authClient } from "~/auth/client";
import { getCallbackURL } from "~/lib/shared";

import SignIn from "./_components/sign-in";
import { SignUp } from "./_components/sign-up";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    authClient.oneTap({
      fetchOptions: {
        onError: ({ error }) => {
          toast.error(error.message || "An error occurred");
        },
        onSuccess: () => {
          toast.success("Successfully signed in");
          router.push(getCallbackURL(params));
        },
      },
    });
  }, [router, params]);

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="w-full max-w-md">
          <Tabs
            tabs={[
              {
                content: <SignIn />,
                title: "Sign In",
                value: "sign-in",
              },
              {
                content: <SignUp />,
                title: "Sign Up",
                value: "sign-up",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
