"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { Button } from "@acme/ui/button";
import CopyButton from "@acme/ui/copy-button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { PasswordInput } from "@acme/ui/password-input";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters."),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

interface TwoFactorEnableFormProps {
  onSuccess?: () => void;
}

export function TwoFactorEnableForm({ onSuccess }: TwoFactorEnableFormProps) {
  const [loading, startTransition] = useTransition();
  const [totpURI, setTotpURI] = useState<string>("");

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      password: "",
    },
    resolver: zodResolver(passwordSchema),
  });

  const otpForm = useForm<OtpFormValues>({
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(otpSchema),
  });

  const onPasswordSubmit = (data: PasswordFormValues) => {
    startTransition(async () => {
      await authClient.twoFactor.enable({
        fetchOptions: {
          onError(context) {
            toast.error(context.error.message);
          },
          onSuccess(ctx) {
            setTotpURI(ctx.data.totpURI);
          },
        },
        password: data.password,
      });
    });
  };

  const onOtpSubmit = (data: OtpFormValues) => {
    startTransition(async () => {
      await authClient.twoFactor.verifyTotp({
        code: data.otp,
        fetchOptions: {
          onError(context) {
            toast.error(context.error.message);
            otpForm.reset();
          },
          onSuccess() {
            toast.success("2FA enabled successfully");
            onSuccess?.();
          },
        },
      });
    });
  };

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
        <form
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Controller
              name="otp"
              control={otpForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="enable-otp">
                    Scan the QR code with your TOTP app and enter the code
                  </FieldLabel>
                  <Input
                    {...field}
                    id="enable-otp"
                    placeholder="Enter OTP code"
                    aria-invalid={fieldState.invalid}
                    autoComplete="one-time-code"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Verify & Enable"
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form
      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <Controller
          name="password"
          control={passwordForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="enable-password">Password</FieldLabel>
              <PasswordInput
                {...field}
                id="enable-password"
                placeholder="Enter your password"
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Continue"}
      </Button>
    </form>
  );
}
