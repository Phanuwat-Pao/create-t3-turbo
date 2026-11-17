"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";

interface TwoFactorDisableFormProps {
  onSuccess?: () => void;
}

export function TwoFactorDisableForm({ onSuccess }: TwoFactorDisableFormProps) {
  const { t } = useTranslation();

  const disableSchema = z.object({
    password: z.string().min(8, t("validation.passwordMinLength")),
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.disable({
        fetchOptions: {
          onError(context: { error: { message: string } }) {
            toast.error(context.error.message);
          },
          onSuccess() {
            toast.success(t("dashboard.twoFactor.disabledSuccess"));
            onSuccess?.();
          },
        },
        password: value.password,
      });
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: disableSchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="flex flex-col gap-4">
        <FieldGroup>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                autoComplete="current-password"
                hidePasswordLabel={t("common.hidePassword")}
                id="disable-password"
                label={t("common.password")}
                placeholder={t("dashboard.twoFactor.passwordPlaceholder")}
                showPasswordLabel={t("common.showPassword")}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton variant="destructive">
          {t("dashboard.twoFactor.disable")}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
