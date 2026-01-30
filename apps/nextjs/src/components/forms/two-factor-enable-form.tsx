"use client";

import { Button } from "@acme/ui/button";
import CopyButton from "@acme/ui/copy-button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { PasswordInput } from "@acme/ui/password-input";
import { Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters."),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type PasswordFormErrors = Partial<
  Record<keyof PasswordFormValues, { message: string }>
>;
type OtpFormErrors = Partial<Record<keyof OtpFormValues, { message: string }>>;

interface TwoFactorEnableFormProps {
  onSuccess?: () => void;
}

export function TwoFactorEnableForm({ onSuccess }: TwoFactorEnableFormProps) {
  const [loading, startTransition] = useTransition();
  const [totpURI, setTotpURI] = useState<string>("");

  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [otpErrors, setOtpErrors] = useState<OtpFormErrors>({});

  const validatePassword = useCallback((): boolean => {
    const result = passwordSchema.safeParse({ password });
    if (!result.success) {
      const fieldErrors: PasswordFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PasswordFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setPasswordErrors(fieldErrors);
      return false;
    }
    setPasswordErrors({});
    return true;
  }, [password]);

  const validateOtp = useCallback((): boolean => {
    const result = otpSchema.safeParse({ otp });
    if (!result.success) {
      const fieldErrors: OtpFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof OtpFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setOtpErrors(fieldErrors);
      return false;
    }
    setOtpErrors({});
    return true;
  }, [otp]);

  const handlePasswordSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validatePassword()) {
        return;
      }

      startTransition(async () => {
        await authClient.twoFactor.enable({
          fetchOptions: {
            onError(context: { error: { message: string } }) {
              toast.error(context.error.message);
            },
            onSuccess(ctx: { data: { totpURI: string } }) {
              setTotpURI(ctx.data.totpURI);
            },
          },
          password,
        });
      });
    },
    [password, validatePassword]
  );

  const handleOtpSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateOtp()) {
        return;
      }

      startTransition(async () => {
        await authClient.twoFactor.verifyTotp({
          code: otp,
          fetchOptions: {
            onError(context: { error: { message: string } }) {
              toast.error(context.error.message);
              setOtp("");
            },
            onSuccess() {
              toast.success("2FA enabled successfully");
              onSuccess?.();
            },
          },
        });
      });
    },
    [onSuccess, otp, validateOtp]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  const handleOtpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setOtp(e.target.value);
    },
    []
  );

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
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!otpErrors.otp}>
              <FieldLabel htmlFor="enable-otp">
                Scan the QR code with your TOTP app and enter the code
              </FieldLabel>
              <Input
                id="enable-otp"
                placeholder="Enter OTP code"
                aria-invalid={!!otpErrors.otp}
                autoComplete="one-time-code"
                value={otp}
                onChange={handleOtpChange}
              />
              {otpErrors.otp && <FieldError errors={[otpErrors.otp]} />}
            </Field>
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
    <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!passwordErrors.password}>
          <FieldLabel htmlFor="enable-password">Password</FieldLabel>
          <PasswordInput
            id="enable-password"
            placeholder="Enter your password"
            aria-invalid={!!passwordErrors.password}
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordErrors.password && (
            <FieldError errors={[passwordErrors.password]} />
          )}
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Continue"}
      </Button>
    </form>
  );
}
