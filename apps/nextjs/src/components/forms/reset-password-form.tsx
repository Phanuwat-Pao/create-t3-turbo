"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { Button } from "@acme/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { PasswordInput } from "@acme/ui/password-input";

const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, "Please confirm your password."),
    password: z.string().min(8, "Password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
type FormErrors = Partial<
  Record<keyof ResetPasswordFormValues, { message: string }>
>;

interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
}

export function ResetPasswordForm({
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const [loading, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      const res = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success("Password reset successfully");
      onSuccess?.();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="reset-password">New password</FieldLabel>
          <PasswordInput
            id="reset-password"
            placeholder="Enter new password"
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <FieldError errors={[errors.password]} />}
        </Field>
        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="reset-confirm-password">
            Confirm password
          </FieldLabel>
          <PasswordInput
            id="reset-confirm-password"
            placeholder="Confirm new password"
            aria-invalid={!!errors.confirmPassword}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          "Reset password"
        )}
      </Button>
    </form>
  );
}
