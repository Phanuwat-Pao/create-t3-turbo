"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { LastUsedIndicator } from "~/components/last-used-indicator";
import Link from "~/components/link";
import { useIsHydrated } from "~/hooks/use-hydrated";
import { withLocale } from "~/i18n/localized-path";
import { useLocale } from "~/i18n/use-locale";

interface SignInFormProps {
  onSuccess?: () => void;
  callbackURL?: string;
  showPasswordToggle?: boolean;
}

export function SignInForm({
  onSuccess,
  callbackURL = "/dashboard",
  showPasswordToggle = false,
}: SignInFormProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const isMounted = useIsHydrated();

  const signInSchema = z.object({
    email: z.email(t("validation.emailRequired")),
    password: z.string().min(1, t("validation.passwordRequired")),
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
          callbackURL: withLocale(callbackURL, locale),
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
        },
        {
          onError(context: { error: { message: string } }) {
            toast.error(context.error.message);
          },
          onSuccess() {
            toast.success(t("auth.signIn.successMessage"));
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
      {t("auth.signIn.forgotPassword")}
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
                label={t("auth.signIn.emailLabel")}
                placeholder={t("auth.signIn.emailPlaceholder")}
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
                  label={t("auth.signIn.passwordLabel")}
                  labelSuffix={forgotPasswordLink}
                  placeholder={t("auth.signIn.passwordPlaceholder")}
                />
              ) : (
                <field.TextField
                  autoComplete="current-password"
                  id="sign-in-password"
                  label={t("auth.signIn.passwordLabel")}
                  labelSuffix={forgotPasswordLink}
                  placeholder={t("auth.signIn.passwordPlaceholder")}
                  type="password"
                />
              )
            }
          </form.AppField>
          <form.AppField name="rememberMe">
            {(field) => (
              <field.CheckboxField
                id="sign-in-remember"
                label={t("auth.signIn.rememberMe")}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="relative w-full">
          {t("auth.signIn.loginButton")}
          {isMounted && authClient.isLastUsedLoginMethod("email") && (
            <LastUsedIndicator />
          )}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
