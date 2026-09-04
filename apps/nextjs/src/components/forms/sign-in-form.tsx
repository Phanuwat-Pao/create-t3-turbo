"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { LastUsedIndicator } from "~/components/last-used-indicator";
import { useIsHydrated } from "~/hooks/use-hydrated";
import type { Dictionary } from "~/i18n/get-dictionary";

interface SignInFormProps {
  onSuccess?: () => void;
  callbackURL?: string;
  showPasswordToggle?: boolean;
  dict: Dictionary;
}

export function SignInForm({
  onSuccess,
  callbackURL = "/dashboard",
  showPasswordToggle = false,
  dict,
}: SignInFormProps) {
  const isMounted = useIsHydrated();

  const signInSchema = z.object({
    email: z.email(dict.validation.emailRequired),
    password: z.string().min(1, dict.validation.passwordRequired),
    rememberMe: z.boolean(),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          callbackURL,
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
        },
        {
          onError(context: { error: { message: string } }) {
            toast.error(context.error.message);
          },
          onSuccess() {
            toast.success(dict.auth.signIn.successMessage);
            onSuccess?.();
          },
        }
      );
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: signInSchema,
    },
  });

  const forgotPasswordLink = (
    <Link
      className="text-foreground ml-auto inline-block text-sm underline"
      href="/forget-password"
    >
      {dict.auth.signIn.forgotPassword}
    </Link>
  );

  return (
    <form.AppForm>
      <form.Form className="grid gap-2">
        <FieldGroup>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                id="sign-in-email"
                label={dict.auth.signIn.emailLabel}
                placeholder={dict.auth.signIn.emailPlaceholder}
                type="email"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) =>
              showPasswordToggle ? (
                <field.PasswordField
                  autoComplete="current-password"
                  id="sign-in-password"
                  label={dict.auth.signIn.passwordLabel}
                  labelSuffix={forgotPasswordLink}
                  placeholder={dict.auth.signIn.passwordPlaceholder}
                />
              ) : (
                <field.TextField
                  autoComplete="current-password"
                  id="sign-in-password"
                  label={dict.auth.signIn.passwordLabel}
                  labelSuffix={forgotPasswordLink}
                  placeholder={dict.auth.signIn.passwordPlaceholder}
                  type="password"
                />
              )
            }
          </form.AppField>
          <form.AppField name="rememberMe">
            {(field) => (
              <field.CheckboxField
                id="sign-in-remember"
                label={dict.auth.signIn.rememberMe}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="relative w-full">
          {dict.auth.signIn.loginButton}
          {isMounted && authClient.isLastUsedLoginMethod("email") && (
            <LastUsedIndicator />
          )}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
