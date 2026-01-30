"use client";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import * as z from "zod";

import { authClient } from "~/auth/client";

const totpSchema = z.object({
  code: z
    .string()
    .length(6, "TOTP code must be 6 digits.")
    .regex(/^\d+$/, "TOTP code must be digits only."),
});

type TotpFormValues = z.infer<typeof totpSchema>;
type FormErrors = Partial<Record<keyof TotpFormValues, { message: string }>>;

interface TwoFactorTotpFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function TwoFactorTotpForm({
  onSuccess,
  onError,
}: TwoFactorTotpFormProps) {
  const [loading, startTransition] = useTransition();
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const result = totpSchema.safeParse({ code });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof TotpFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [code]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        const res = await authClient.twoFactor.verifyTotp({
          code,
        });
        if (res.data?.token) {
          setIsVerified(true);
          onSuccess?.();
        } else {
          onError?.("Invalid TOTP code");
          setErrors({ code: { message: "Invalid TOTP code" } });
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

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.code}>
          <FieldLabel htmlFor="totp-code">TOTP Code</FieldLabel>
          <Input
            id="totp-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            aria-invalid={!!errors.code}
            autoComplete="one-time-code"
            value={code}
            onChange={handleCodeChange}
          />
          {errors.code && <FieldError errors={[errors.code]} />}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
      </Button>
    </form>
  );
}
