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

interface TwoFactorEnableFormProps {
  onSuccess?: () => void;
}

export function TwoFactorEnableForm({ onSuccess }: TwoFactorEnableFormProps) {
  const { t } = useTranslation();
  const [totpURI, setTotpURI] = useState<string>("");

  const passwordSchema = z.object({
    password: z.string().min(8, t("validation.passwordMinLength")),
  });

  const otpSchema = z.object({
    otp: z.string().min(6, t("validation.otpMinLength")),
  });

  const passwordForm = useAppForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.enable({
        fetchOptions: {
          onError(context: { error: { message: string } }) {
            toast.error(context.error.message);
          },
          onSuccess(ctx: { data: { totpURI: string } }) {
            setTotpURI(ctx.data.totpURI);
          },
        },
        password: value.password,
      });
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: passwordSchema,
    },
  });

  const otpForm = useAppForm({
    defaultValues: {
      otp: "",
    },
    onSubmit: async ({ formApi, value }) => {
      await authClient.twoFactor.verifyTotp({
        code: value.otp,
        fetchOptions: {
          onError(context: { error: { message: string } }) {
            toast.error(context.error.message);
            formApi.resetField("otp");
          },
          onSuccess() {
            toast.success(t("dashboard.twoFactor.enabledSuccess"));
            onSuccess?.();
          },
        },
      });
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: otpSchema,
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
          <CopyButton
            copiedLabel={t("common.copied")}
            copyLabel={t("common.copyToClipboard")}
            textToCopy={totpURI}
          />
        </div>
        <otpForm.AppForm>
          <otpForm.Form className="flex flex-col gap-4">
            <FieldGroup>
              <otpForm.AppField name="otp">
                {(field) => (
                  <field.TextField
                    autoComplete="one-time-code"
                    id="enable-otp"
                    label={t("dashboard.twoFactor.otpLabel")}
                    placeholder={t("dashboard.twoFactor.otpPlaceholder")}
                  />
                )}
              </otpForm.AppField>
            </FieldGroup>
            <otpForm.SubmitButton>
              {t("dashboard.twoFactor.verifyAndEnable")}
            </otpForm.SubmitButton>
          </otpForm.Form>
        </otpForm.AppForm>
      </div>
    );
  }

  return (
    <passwordForm.AppForm>
      <passwordForm.Form className="flex flex-col gap-4">
        <FieldGroup>
          <passwordForm.AppField name="password">
            {(field) => (
              <field.PasswordField
                autoComplete="current-password"
                hidePasswordLabel={t("common.hidePassword")}
                id="enable-password"
                label={t("common.password")}
                placeholder={t("dashboard.twoFactor.passwordPlaceholder")}
                showPasswordLabel={t("common.showPassword")}
              />
            )}
          </passwordForm.AppField>
        </FieldGroup>
        <passwordForm.SubmitButton>
          {t("dashboard.twoFactor.continueButton")}
        </passwordForm.SubmitButton>
      </passwordForm.Form>
    </passwordForm.AppForm>
  );
}
