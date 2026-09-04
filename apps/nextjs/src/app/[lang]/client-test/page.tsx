"use client";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { useSessionQuery } from "~/data/user/session-query";
import { useSignOutMutation } from "~/data/user/sign-out-mutation";
import { getAvatarUrl } from "~/lib/avatar";

const signInSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function Page() {
  const { data: session, isPending, error } = useSessionQuery();
  const signOutMutation = useSignOutMutation();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ formApi, value }) => {
      await authClient.signIn.email(
        {
          callbackURL: "/client-test",
          email: value.email,
          password: value.password,
        },
        {
          onError: (ctx: { error: { message: string } }) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Successfully logged in!");
            formApi.reset();
          },
        }
      );
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: signInSchema,
    },
  });

  const handleSignOut = useCallback(
    () => signOutMutation.mutate(),
    [signOutMutation]
  );

  return (
    <div className="container mx-auto space-y-8 py-10">
      <h1 className="text-center text-2xl font-bold">
        Client Authentication Test
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <form.AppForm>
            <form.Form>
              <CardContent>
                <FieldGroup className="gap-4">
                  <form.AppField name="email">
                    {(field) => (
                      <field.TextField
                        autoComplete="email"
                        id="email"
                        label="Email"
                        placeholder="m@example.com"
                        type="email"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="password">
                    {(field) => (
                      <field.TextField
                        autoComplete="current-password"
                        id="password"
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
              </CardContent>
              <CardFooter>
                <form.SubmitButton
                  className="w-full"
                  submittingLabel="Signing in..."
                >
                  Sign In
                </form.SubmitButton>
              </CardFooter>
            </form.Form>
          </form.AppForm>
        </Card>

        {/* Session Display */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>
              {isPending && "Loading session..."}
              {!isPending && session && "You are currently logged in"}
              {!isPending && !session && "You are not logged in"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && (
              <div className="flex justify-center py-4">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            )}
            {!isPending && error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-4">
                Error: {error.message}
              </div>
            )}
            {!isPending && !error && session && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAvatarUrl(session.user.id)}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="bg-muted rounded-md p-4">
                  <p className="mb-2 text-sm font-medium">Session Details:</p>
                  <pre className="max-h-40 overflow-auto text-xs">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {!isPending && !error && !session && (
              <div className="text-muted-foreground py-8 text-center">
                <p>Sign in to view your session information</p>
              </div>
            )}
          </CardContent>
          {session && (
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
                disabled={signOutMutation.isPending}
              >
                {signOutMutation.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Sign Out"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
