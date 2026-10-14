"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { useChangePasswordMutation } from "~/data/user/change-password-mutation";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ChangePasswordForm({
  onSuccess,
  onError,
}: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const changePasswordMutation = useChangePasswordMutation();

  const changePasswordSchema = z
    .object({
      confirmPassword: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
      currentPassword: z
        .string()
        .min(1, t("validation.currentPasswordRequired")),
      newPassword: z
        .string()
        .min(8, t("validation.passwordMinLength"))
        .max(128, t("validation.passwordMaxLength")),
      revokeOtherSessions: z.boolean(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("validation.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

  const form = useAppForm({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: false,
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await changePasswordMutation.mutateAsync({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: value.revokeOtherSessions,
        });
      } catch (error) {
        onError?.(error instanceof Error ? error.message : t("common.error"));
        return;
      }
      formApi.reset();
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: changePasswordSchema,
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <form.AppField name="currentPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="current-password"
                disabled={isSubmitting}
                id="current-password"
                label={t("dashboard.changePassword.currentPasswordLabel")}
                placeholder={t(
                  "dashboard.changePassword.currentPasswordPlaceholder"
                )}
              />
            )}
          </form.AppField>

          <form.AppField name="newPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                disabled={isSubmitting}
                id="new-password"
                label={t("dashboard.changePassword.newPasswordLabel")}
                placeholder={t(
                  "dashboard.changePassword.newPasswordPlaceholder"
                )}
              />
            )}
          </form.AppField>

          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                disabled={isSubmitting}
                id="confirm-password"
                label={t("dashboard.changePassword.confirmPasswordLabel")}
                placeholder={t(
                  "dashboard.changePassword.confirmPasswordPlaceholder"
                )}
              />
            )}
          </form.AppField>

          <form.AppField name="revokeOtherSessions">
            {(field) => (
              <field.CheckboxField
                disabled={isSubmitting}
                id="revoke-sessions"
                label={t("dashboard.changePassword.revokeOtherSessions")}
              />
            )}
          </form.AppField>

          <form.SubmitButton>
            {t("dashboard.changePassword.changeButton")}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
