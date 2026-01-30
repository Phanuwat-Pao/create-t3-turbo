"use client";

import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { Button } from "@acme/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { Input } from "@acme/ui/input";

const otpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP code must be 6 digits.")
    .regex(/^\d+$/, "OTP code must be digits only."),
});

type OtpFormValues = z.infer<typeof otpSchema>;
type FormErrors = Partial<Record<keyof OtpFormValues, { message: string }>>;

interface TwoFactorEmailOtpFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  userEmail?: string;
}

export function TwoFactorEmailOtpForm({
  onSuccess,
  onError,
  userEmail = "your email",
}: TwoFactorEmailOtpFormProps) {
  const [loading, startTransition] = useTransition();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const result = otpSchema.safeParse({ code });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof OtpFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [code]);

  const handleSendOtp = useCallback(() => {
    startTransition(async () => {
      await authClient.twoFactor.sendOtp();
      setIsOtpSent(true);
      setMessage(`OTP sent to ${userEmail}`);
    });
  }, [userEmail]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        const res = await authClient.twoFactor.verifyOtp({
          code,
        });
        if (res.data) {
          setIsVerified(true);
          setMessage("OTP validated successfully");
          onSuccess?.();
        } else {
          onError?.("Invalid OTP");
          setErrors({ code: { message: "Invalid OTP" } });
        }
      });
    },
    [code, onError, onSuccess, validate]
  );

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCode(e.target.value);
    },
    []
  );

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold">Verification Successful</p>
      </div>
    );
  }

  if (!isOtpSent) {
    return (
      <div className="grid gap-4">
        <Button onClick={handleSendOtp} className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" /> Send OTP to Email
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.code}>
          <FieldLabel htmlFor="email-otp-code">One-Time Password</FieldLabel>
          {message && (
            <p className="text-muted-foreground flex items-center gap-1 py-1 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {message}
            </p>
          )}
          <Input
            id="email-otp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            aria-invalid={!!errors.code}
            autoComplete="one-time-code"
            value={code}
            onChange={handleCodeChange}
          />
          {errors.code && <FieldError errors={[errors.code]} />}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading || isVerified}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Validate OTP"
        )}
      </Button>
    </form>
  );
}
