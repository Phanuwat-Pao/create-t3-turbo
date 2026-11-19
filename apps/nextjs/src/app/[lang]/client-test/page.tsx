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
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { useSessionQuery } from "~/data/user/session-query";
import { useSignOutMutation } from "~/data/user/sign-out-mutation";
import { withLocale } from "~/i18n/localized-path";
import { useLocale } from "~/i18n/use-locale";
import { getAvatarUrl } from "~/lib/avatar";

export default function Page() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data: session, isPending, error } = useSessionQuery();
  const signOutMutation = useSignOutMutation();

  const signInSchema = z.object({
    email: z.email(t("validation.emailRequired")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ formApi, value }) => {
      await authClient.signIn.email(
        {
          callbackURL: withLocale("/client-test", locale),
          email: value.email,
          password: value.password,
        },
        {
          onError: (ctx: { error: { message: string } }) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success(t("clientTest.signInSuccess"));
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
        {t("clientTest.title")}
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("clientTest.signInTitle")}</CardTitle>
            <CardDescription>
              {t("clientTest.signInDescription")}
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
                        label={t("common.email")}
                        placeholder={t("auth.signIn.emailPlaceholder")}
                        type="email"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="password">
                    {(field) => (
                      <field.TextField
                        autoComplete="current-password"
                        id="password"
                        label={t("common.password")}
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
                  submittingLabel={t("clientTest.signingIn")}
                >
                  {t("clientTest.signInButton")}
                </form.SubmitButton>
              </CardFooter>
            </form.Form>
          </form.AppForm>
        </Card>

        {/* Session Display */}
        <Card>
          <CardHeader>
            <CardTitle>{t("clientTest.sessionTitle")}</CardTitle>
            <CardDescription>
              {isPending && t("clientTest.loadingSession")}
              {!isPending && session && t("clientTest.loggedIn")}
              {!isPending && !session && t("clientTest.notLoggedIn")}
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
                {t("clientTest.error", { message: error.message })}
              </div>
            )}
            {!isPending && !error && session && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* oxlint-disable-next-line @next/next/no-img-element -- /api/avatar redirects to S3 and OAuth hosts that next/image is not configured for */}
                  <img
                    src={getAvatarUrl(session.user.id)}
                    alt={t("clientTest.profileAlt")}
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
                  <p className="mb-2 text-sm font-medium">
                    {t("clientTest.sessionDetails")}
                  </p>
                  <pre className="max-h-40 overflow-auto text-xs">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {!isPending && !error && !session && (
              <div className="text-muted-foreground py-8 text-center">
                <p>{t("clientTest.signInPrompt")}</p>
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
                  t("clientTest.signOut")
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
