"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
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
import { PasswordInput } from "@acme/ui/password-input";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type FormErrors = Partial<
  Record<keyof PasswordFormValues, { message: string }>
>;

interface TwoFactorQrFormProps {
  onSuccess?: (totpURI: string) => void;
}

export function TwoFactorQrForm({ onSuccess }: TwoFactorQrFormProps) {
  const [loading, startTransition] = useTransition();
  const [totpURI, setTotpURI] = useState<string>("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const result = passwordSchema.safeParse({ password });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof PasswordFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [password]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        await authClient.twoFactor.getTotpUri(
          { password },
          {
            onError(context) {
              toast.error(context.error.message);
            },
            onSuccess(context) {
              setTotpURI(context.data.totpURI);
              onSuccess?.(context.data.totpURI);
            },
          }
        );
      });
    },
    [onSuccess, password, validate]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
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
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="qr-password">Password</FieldLabel>
          <PasswordInput
            id="qr-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
          />
          {errors.password && <FieldError errors={[errors.password]} />}
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Show QR Code"
        )}
      </Button>
    </form>
  );
}
