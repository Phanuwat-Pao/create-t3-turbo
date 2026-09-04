"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import * as z from "zod";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";

interface ForgetPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  dict: Dictionary;
}

export function ForgetPasswordForm({
  onSuccess,
  onError,
  redirectTo = "/reset-password",
  dict,
}: ForgetPasswordFormProps) {
  const forgetPasswordSchema = z.object({
    email: z.email(dict.validation.emailRequired),
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
        onError?.(dict.common.error);
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
                label={dict.auth.forgotPassword.emailLabel}
                placeholder={dict.auth.forgotPassword.emailPlaceholder}
                type="email"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {dict.auth.forgotPassword.sendResetLink}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
