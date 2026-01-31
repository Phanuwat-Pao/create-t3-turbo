"use client";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { PasswordInput } from "@acme/ui/password-input";
import { Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import * as z from "zod";

import type { Dictionary } from "~/i18n/get-dictionary";

import { authClient } from "~/auth/client";

interface ResetPasswordFormValues {
  confirmPassword: string;
  password: string;
}
type FormErrors = Partial<
  Record<keyof ResetPasswordFormValues, { message: string }>
>;

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
  dict: Dictionary;
}

export function ResetPasswordForm({
  token,
  onSuccess,
  dict,
}: ResetPasswordFormProps) {
  const [loading, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const resetPasswordSchema = z
    .object({
      confirmPassword: z
        .string()
        .min(1, dict.validation.confirmPasswordRequired),
      password: z.string().min(8, dict.validation.passwordMinLength),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: dict.validation.passwordsDoNotMatch,
      path: ["confirmPassword"],
    });

  const validate = useCallback((): boolean => {
    const result = resetPasswordSchema.safeParse({ confirmPassword, password });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ResetPasswordFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [confirmPassword, password, resetPasswordSchema]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        const res = await authClient.resetPassword({
          newPassword: password,
          token,
        });
        if (res.error) {
          toast.error(res.error.message);
          return;
        }
        toast.success(dict.auth.resetPassword.successMessage);
        onSuccess?.();
      });
    },
    [
      dict.auth.resetPassword.successMessage,
      onSuccess,
      password,
      token,
      validate,
    ]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    []
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setConfirmPassword(e.target.value),
    []
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="reset-password">
            {dict.auth.resetPassword.newPasswordLabel}
          </FieldLabel>
          <PasswordInput
            id="reset-password"
            placeholder={dict.auth.resetPassword.newPasswordPlaceholder}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
          />
          {errors.password && <FieldError errors={[errors.password]} />}
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="reset-confirm-password">
            {dict.auth.resetPassword.confirmPasswordLabel}
          </FieldLabel>
          <PasswordInput
            id="reset-confirm-password"
            placeholder={dict.auth.resetPassword.confirmPasswordPlaceholder}
            aria-invalid={!!errors.confirmPassword}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          {errors.confirmPassword && (
            <FieldError errors={[errors.confirmPassword]} />
          )}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          dict.auth.resetPassword.resetButton
        )}
      </Button>
    </form>
  );
}
