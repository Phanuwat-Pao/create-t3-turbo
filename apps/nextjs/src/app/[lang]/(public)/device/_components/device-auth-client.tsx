"use client";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Card } from "@acme/ui/card";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import * as z from "zod";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";

interface DeviceAuthClientProps {
  dict: Dictionary;
}

export function DeviceAuthClient({ dict }: DeviceAuthClientProps) {
  const router = useRouter();
  const params = useSearchParams();
  const initialUserCode = params.get("user_code") ?? "";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deviceSchema = z.object({
    userCode: z.string().trim().min(1, dict.device.invalidCode),
  });

  const form = useAppForm({
    defaultValues: {
      userCode: initialUserCode,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        const finalCode = value.userCode
          .trim()
          .replaceAll("-", "")
          .toUpperCase();
        // Get the device authorization status
        const response = await authClient.device({
          query: {
            user_code: finalCode,
          },
        });

        if (response.data) {
          router.push(`/device/approve?user_code=${finalCode}`);
        }
      } catch (error: unknown) {
        setErrorMessage(
          error instanceof Error ? error.message : dict.device.invalidCode
        );
      }
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: deviceSchema,
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{dict.device.title}</h1>
            <p className="text-muted-foreground mt-2">
              {dict.device.description}
            </p>
          </div>

          <form.AppForm>
            <form.Form className="space-y-4">
              <FieldGroup>
                <form.AppField name="userCode">
                  {(field) => (
                    <field.TextField
                      className="text-center font-mono text-lg uppercase"
                      id="userCode"
                      label={dict.device.codeLabel}
                      maxLength={9}
                      placeholder={dict.device.codePlaceholder}
                      type="text"
                    />
                  )}
                </form.AppField>
              </FieldGroup>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form.SubmitButton
                className="w-full"
                submittingLabel={dict.device.verifying}
              >
                {dict.device.continueButton}
              </form.SubmitButton>
            </form.Form>
          </form.AppForm>
        </div>
      </Card>
    </div>
  );
}
