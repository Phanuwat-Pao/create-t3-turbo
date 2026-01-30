"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import * as z from "zod";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { PasswordInput } from "@acme/ui/password-input";
import { useChangePasswordMutation } from "~/data/user/change-password-mutation";

const changePasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, "Please confirm your password"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters"),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
type FormErrors = Partial<
  Record<keyof ChangePasswordFormValues, { message: string }>
>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ChangePasswordForm({
  onSuccess,
  onError,
}: ChangePasswordFormProps) {
  const changePasswordMutation = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const result = changePasswordSchema.safeParse({
      confirmPassword,
      currentPassword,
      newPassword,
      revokeOtherSessions,
    });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ChangePasswordFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [confirmPassword, currentPassword, newPassword, revokeOtherSessions]);

  const resetForm = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setRevokeOtherSessions(false);
    setErrors({});
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      changePasswordMutation.mutate(
        {
          currentPassword,
          newPassword,
          revokeOtherSessions,
        },
        {
          onError: (error) => {
            onError?.(error.message);
          },
          onSuccess: () => {
            resetForm();
            onSuccess?.();
          },
        }
      );
    },
    [
      changePasswordMutation,
      currentPassword,
      newPassword,
      onError,
      onSuccess,
      resetForm,
      revokeOtherSessions,
      validate,
    ]
  );

  const handleCurrentPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentPassword(e.target.value);
    },
    []
  );

  const handleNewPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewPassword(e.target.value);
    },
    []
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
    },
    []
  );

  const handleRevokeSessionsChange = useCallback((checked: boolean | "indeterminate") => {
    setRevokeOtherSessions(checked === true);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!errors.currentPassword}>
          <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            placeholder="Current password"
            disabled={changePasswordMutation.isPending}
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
          />
          {errors.currentPassword && (
            <FieldError errors={[errors.currentPassword]} />
          )}
        </Field>

        <Field data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="new-password">New Password</FieldLabel>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            placeholder="New password"
            disabled={changePasswordMutation.isPending}
            value={newPassword}
            onChange={handleNewPasswordChange}
          />
          {errors.newPassword && <FieldError errors={[errors.newPassword]} />}
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            placeholder="Confirm password"
            disabled={changePasswordMutation.isPending}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          {errors.confirmPassword && (
            <FieldError errors={[errors.confirmPassword]} />
          )}
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox
            id="revoke-sessions"
            checked={revokeOtherSessions}
            onCheckedChange={handleRevokeSessionsChange}
            disabled={changePasswordMutation.isPending}
          />
          <label htmlFor="revoke-sessions" className="text-sm">
            Sign out from other devices
          </label>
        </div>

        <Button type="submit" disabled={changePasswordMutation.isPending}>
          {changePasswordMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            "Change Password"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
