"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import SignIn from "~/app/(auth)/sign-in/_components/sign-in";
import { SignUp } from "~/app/(auth)/sign-in/_components/sign-up";
import { authClient } from "~/auth/client";
import { Tabs } from "@acme/ui/tabs2";
import { getCallbackURL } from "~/lib/shared";

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
  }, []);

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
