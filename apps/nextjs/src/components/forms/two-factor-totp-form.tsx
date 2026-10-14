"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { authClient } from "~/auth/client";

interface TwoFactorTotpFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function TwoFactorTotpForm({
  onSuccess,
  onError,
}: TwoFactorTotpFormProps) {
  const { t } = useTranslation();
  const [isVerified, setIsVerified] = useState(false);

  const totpSchema = z.object({
    code: z
      .string()
      .length(6, t("auth.twoFactor.codeMustBe6Digits"))
      .regex(/^\d+$/u, t("auth.twoFactor.codeMustBeDigitsOnly")),
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
        onError?.(t("auth.twoFactor.invalidCode"));
        return { fields: { code: t("auth.twoFactor.invalidCode") } };
      },
    },
  });

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold">
          {t("auth.twoFactor.verificationSuccess")}
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
                label={t("auth.twoFactor.codeLabel")}
                maxLength={6}
                placeholder={t("auth.twoFactor.codePlaceholder")}
                type="text"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {t("auth.twoFactor.verifyButton")}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
