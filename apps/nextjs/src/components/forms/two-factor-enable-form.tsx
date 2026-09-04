"use client";

import CopyButton from "@acme/ui/copy-button";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useState } from "react";
import { QRCode } from "react-qr-code";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters."),
});

interface TwoFactorEnableFormProps {
  onSuccess?: () => void;
}

export function TwoFactorEnableForm({ onSuccess }: TwoFactorEnableFormProps) {
  const [totpURI, setTotpURI] = useState<string>("");

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
            toast.success("2FA enabled successfully");
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
          <p className="text-muted-foreground text-sm">Copy URI to clipboard</p>
          <CopyButton textToCopy={totpURI} />
        </div>
        <otpForm.AppForm>
          <otpForm.Form className="flex flex-col gap-4">
            <FieldGroup>
              <otpForm.AppField name="otp">
                {(field) => (
                  <field.TextField
                    autoComplete="one-time-code"
                    id="enable-otp"
                    label="Scan the QR code with your TOTP app and enter the code"
                    placeholder="Enter OTP code"
                  />
                )}
              </otpForm.AppField>
            </FieldGroup>
            <otpForm.SubmitButton>Verify & Enable</otpForm.SubmitButton>
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
                id="enable-password"
                label="Password"
                placeholder="Enter your password"
              />
            )}
          </passwordForm.AppField>
        </FieldGroup>
        <passwordForm.SubmitButton>Continue</passwordForm.SubmitButton>
      </passwordForm.Form>
    </passwordForm.AppForm>
  );
}
