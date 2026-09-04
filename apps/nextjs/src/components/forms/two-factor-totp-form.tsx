"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";

interface TwoFactorTotpFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  dict: Dictionary;
}

export function TwoFactorTotpForm({
  onSuccess,
  onError,
  dict,
}: TwoFactorTotpFormProps) {
  const [isVerified, setIsVerified] = useState(false);

  const totpSchema = z.object({
    code: z
      .string()
      .length(6, dict.auth.twoFactor.codeMustBe6Digits)
      .regex(/^\d+$/u, dict.auth.twoFactor.codeMustBeDigitsOnly),
  });

  const form = useAppForm({
    defaultValues: {
      code: "",
    },
    onSubmit: () => {
      setIsVerified(true);
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: totpSchema,
      // Runs after the schema passes; a rejected code lands on the field so
      // the user sees it inline and the next submit re-checks the server.
      onSubmitAsync: async ({ value }) => {
        const res = await authClient.twoFactor.verifyTotp({
          code: value.code,
        });
        if (res.data?.token) {
          return undefined;
        }
        onError?.(dict.auth.twoFactor.invalidCode);
        return { fields: { code: dict.auth.twoFactor.invalidCode } };
      },
    },
  });

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold">
          {dict.auth.twoFactor.verificationSuccess}
        </p>
      </div>
    );
  }

  return (
    <form.AppForm>
      <form.Form className="grid gap-4">
        <FieldGroup>
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                autoComplete="one-time-code"
                id="totp-code"
                inputMode="numeric"
                label={dict.auth.twoFactor.codeLabel}
                maxLength={6}
                placeholder={dict.auth.twoFactor.codePlaceholder}
                type="text"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {dict.auth.twoFactor.verifyButton}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
