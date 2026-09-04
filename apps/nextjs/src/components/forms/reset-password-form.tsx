"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
  dict: Dictionary;
}

export function ResetPasswordForm({
  token,
  onSuccess,
  dict,
}: ResetPasswordFormProps) {
  const resetPasswordSchema = z
    .object({
      confirmPassword: z
        .string()
        .min(1, dict.validation.confirmPasswordRequired),
      password: z.string().min(8, dict.validation.passwordMinLength),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: dict.validation.passwordsDoNotMatch,
      path: ["confirmPassword"],
    });

  const form = useAppForm({
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      const res = await authClient.resetPassword({
        newPassword: value.password,
        token,
      });
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(dict.auth.resetPassword.successMessage);
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: resetPasswordSchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="grid gap-4">
        <FieldGroup>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                id="reset-password"
                label={dict.auth.resetPassword.newPasswordLabel}
                placeholder={dict.auth.resetPassword.newPasswordPlaceholder}
              />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                id="reset-confirm-password"
                label={dict.auth.resetPassword.confirmPasswordLabel}
                placeholder={dict.auth.resetPassword.confirmPasswordPlaceholder}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {dict.auth.resetPassword.resetButton}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
