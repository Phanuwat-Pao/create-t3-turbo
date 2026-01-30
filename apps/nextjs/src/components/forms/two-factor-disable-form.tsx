"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
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

const disableSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type DisableFormValues = z.infer<typeof disableSchema>;
type FormErrors = Partial<Record<keyof DisableFormValues, { message: string }>>;

interface TwoFactorDisableFormProps {
  onSuccess?: () => void;
}

export function TwoFactorDisableForm({ onSuccess }: TwoFactorDisableFormProps) {
  const [loading, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const result = disableSchema.safeParse({ password });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof DisableFormValues;
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
        await authClient.twoFactor.disable({
          fetchOptions: {
            onError(context) {
              toast.error(context.error.message);
            },
            onSuccess() {
              toast.success("2FA disabled successfully");
              onSuccess?.();
            },
          },
          password,
        });
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="disable-password">Password</FieldLabel>
          <PasswordInput
            id="disable-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
          />
          {errors.password && <FieldError errors={[errors.password]} />}
        </Field>
      </FieldGroup>
      <Button type="submit" variant="destructive" disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Disable 2FA"
        )}
      </Button>
    </form>
  );
}
