"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { authClient } from "~/auth/client";

interface ForgetPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export function ForgetPasswordForm({
  onSuccess,
  onError,
  redirectTo = "/reset-password",
}: ForgetPasswordFormProps) {
  const { t } = useTranslation();
  const forgetPasswordSchema = z.object({
    email: z.email(t("validation.emailRequired")),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.requestPasswordReset({
          email: value.email,
          redirectTo,
        });
      } catch {
        onError?.(t("common.error"));
        return;
      }
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: forgetPasswordSchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="grid gap-4">
        <FieldGroup>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                id="forget-email"
                label={t("auth.forgotPassword.emailLabel")}
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                type="email"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {t("auth.forgotPassword.sendResetLink")}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
