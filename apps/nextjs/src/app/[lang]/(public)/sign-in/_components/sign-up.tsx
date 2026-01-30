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

import { SignUpForm } from "~/components/forms/sign-up-form";
import { getCallbackURL } from "~/lib/shared";

export function SignUp() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <Card className="w-full rounded-md rounded-t-none">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm
          onSuccess={() => router.push(getCallbackURL(params))}
          callbackURL={getCallbackURL(params)}
        />
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-center border-t pt-4">
          <p className="text-center text-xs text-neutral-500">
            built with{" "}
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
