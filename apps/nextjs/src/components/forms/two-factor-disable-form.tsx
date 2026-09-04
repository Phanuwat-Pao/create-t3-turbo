"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";

const disableSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

interface TwoFactorDisableFormProps {
  onSuccess?: () => void;
}

export function TwoFactorDisableForm({ onSuccess }: TwoFactorDisableFormProps) {
  const form = useAppForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.disable({
        fetchOptions: {
          onError(context: { error: { message: string } }) {
            toast.error(context.error.message);
          },
          onSuccess() {
            toast.success("2FA disabled successfully");
            onSuccess?.();
          },
        },
        password: value.password,
      });
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: disableSchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="flex flex-col gap-4">
        <FieldGroup>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                autoComplete="current-password"
                id="disable-password"
                label="Password"
                placeholder="Enter your password"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton variant="destructive">Disable 2FA</form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
