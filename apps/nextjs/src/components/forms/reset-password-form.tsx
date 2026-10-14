"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
}

export function ResetPasswordForm({
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const resetPasswordSchema = z
    .object({
      confirmPassword: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
      password: z.string().min(8, t("validation.passwordMinLength")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsDoNotMatch"),
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
      toast.success(t("auth.resetPassword.successMessage"));
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
                label={t("auth.resetPassword.newPasswordLabel")}
                placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
              />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                id="reset-confirm-password"
                label={t("auth.resetPassword.confirmPasswordLabel")}
                placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {t("auth.resetPassword.resetButton")}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
