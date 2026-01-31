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

import type { Dictionary } from "~/i18n/get-dictionary";

import { SignUpForm } from "~/components/forms/sign-up-form";
import { getCallbackURL } from "~/lib/shared";

interface SignUpProps {
  dict: Dictionary;
}

export function SignUp({ dict }: SignUpProps) {
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
          {dict.auth.signUp.title}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {dict.auth.signUp.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm
          onSuccess={handleSuccess}
          callbackURL={callbackURL}
          dict={dict}
        />
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-center border-t pt-4">
          <p className="text-center text-xs text-neutral-500">
            {dict.auth.signUp.builtWith}{" "}
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
