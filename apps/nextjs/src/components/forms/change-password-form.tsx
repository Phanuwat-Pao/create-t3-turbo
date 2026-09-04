"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import * as z from "zod";

import { useChangePasswordMutation } from "~/data/user/change-password-mutation";
import type { Dictionary } from "~/i18n/get-dictionary";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  dict: Dictionary;
}

export function ChangePasswordForm({
  onSuccess,
  onError,
  dict,
}: ChangePasswordFormProps) {
  const changePasswordMutation = useChangePasswordMutation();

  const changePasswordSchema = z
    .object({
      confirmPassword: z
        .string()
        .min(1, dict.validation.confirmPasswordRequired),
      currentPassword: z
        .string()
        .min(1, dict.validation.currentPasswordRequired),
      newPassword: z
        .string()
        .min(8, dict.validation.passwordMinLength)
        .max(128, dict.validation.passwordMaxLength),
      revokeOtherSessions: z.boolean(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: dict.validation.passwordsDoNotMatch,
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
        onError?.(error instanceof Error ? error.message : dict.common.error);
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
                label={dict.dashboard.changePassword.currentPasswordLabel}
                placeholder={
                  dict.dashboard.changePassword.currentPasswordPlaceholder
                }
              />
            )}
          </form.AppField>

          <form.AppField name="newPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                disabled={isSubmitting}
                id="new-password"
                label={dict.dashboard.changePassword.newPasswordLabel}
                placeholder={
                  dict.dashboard.changePassword.newPasswordPlaceholder
                }
              />
            )}
          </form.AppField>

          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                autoComplete="new-password"
                disabled={isSubmitting}
                id="confirm-password"
                label={dict.dashboard.changePassword.confirmPasswordLabel}
                placeholder={
                  dict.dashboard.changePassword.confirmPasswordPlaceholder
                }
              />
            )}
          </form.AppField>

          <form.AppField name="revokeOtherSessions">
            {(field) => (
              <field.CheckboxField
                disabled={isSubmitting}
                id="revoke-sessions"
                label={dict.dashboard.changePassword.revokeOtherSessions}
              />
            )}
          </form.AppField>

          <form.SubmitButton>
            {dict.dashboard.changePassword.changeButton}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
