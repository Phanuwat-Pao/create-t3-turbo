"use client";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import * as z from "zod";

import { authClient } from "~/auth/client";

const forgetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;
type FormErrors = Partial<
  Record<keyof ForgetPasswordFormValues, { message: string }>
>;

interface ForgetPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export function ForgetPasswordForm({
  onSuccess,
  onError,
  redirectTo = "/reset-password",
}: ForgetPasswordFormProps) {
  const [loading, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const result = forgetPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ForgetPasswordFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [email]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        try {
          await authClient.requestPasswordReset({
            email,
            redirectTo,
          });
          onSuccess?.();
        } catch {
          onError?.("An error occurred. Please try again.");
        }
      });
    },
    [validate, email, redirectTo, onSuccess, onError]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="forget-email">Email</FieldLabel>
          <Input
            id="forget-email"
            type="email"
            placeholder="Enter your email"
            aria-invalid={!!errors.email}
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
