"use client";

import CopyButton from "@acme/ui/copy-button";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCode } from "react-qr-code";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";

interface TwoFactorQrFormProps {
  onSuccess?: (totpURI: string) => void;
}

export function TwoFactorQrForm({ onSuccess }: TwoFactorQrFormProps) {
  const { t } = useTranslation();
  const [totpURI, setTotpURI] = useState<string>("");

  const passwordSchema = z.object({
    password: z.string().min(8, t("validation.passwordMinLength")),
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.getTotpUri(
        { password: value.password },
        {
          onError(context: { error: { message: string } }) {
            toast.error(context.error.message);
          },
          onSuccess(context: { data: { totpURI: string } }) {
            setTotpURI(context.data.totpURI);
            onSuccess?.(context.data.totpURI);
          },
        }
      );
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: passwordSchema,
    },
  });

  if (totpURI) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <QRCode value={totpURI} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <p className="text-muted-foreground text-sm">
            {t("dashboard.twoFactor.copyUri")}
          </p>
          <CopyButton textToCopy={totpURI} />
        </div>
      </div>
    );
  }

  return (
    <form.AppForm>
      <form.Form className="flex flex-col gap-4">
        <FieldGroup>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                autoComplete="current-password"
                id="qr-password"
                label={t("common.password")}
                placeholder={t("dashboard.twoFactor.passwordPlaceholder")}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton>
          {t("dashboard.twoFactor.showQrCode")}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
