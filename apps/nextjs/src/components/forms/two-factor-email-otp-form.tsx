"use client";

import { Button } from "@acme/ui/button";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import * as z from "zod";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";

interface TwoFactorEmailOtpFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  userEmail?: string;
  dict: Dictionary;
}

export function TwoFactorEmailOtpForm({
  onSuccess,
  onError,
  userEmail,
  dict,
}: TwoFactorEmailOtpFormProps) {
  const [isSending, startSending] = useTransition();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");

  const displayEmail = userEmail ?? dict.auth.twoFactor.yourEmail;

  const otpSchema = z.object({
    code: z
      .string()
      .length(6, dict.auth.twoFactor.otpMustBe6Digits)
      .regex(/^\d+$/u, dict.auth.twoFactor.otpMustBeDigitsOnly),
  });

  const form = useAppForm({
    defaultValues: {
      code: "",
    },
    onSubmit: () => {
      setIsVerified(true);
      setMessage(dict.auth.twoFactor.otpValidatedSuccess);
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: otpSchema,
      // Runs after the schema passes; a rejected code lands on the field so
      // the user sees it inline and the next submit re-checks the server.
      onSubmitAsync: async ({ value }) => {
        const res = await authClient.twoFactor.verifyOtp({ code: value.code });
        if (res.data) {
          return undefined;
        }
        onError?.(dict.auth.twoFactor.invalidOtp);
        return { fields: { code: dict.auth.twoFactor.invalidOtp } };
      },
    },
  });

  const handleSendOtp = useCallback(() => {
    startSending(async () => {
      await authClient.twoFactor.sendOtp();
      setIsOtpSent(true);
      setMessage(
        dict.auth.twoFactor.otpSentTo.replace("{{email}}", displayEmail)
      );
    });
  }, [dict.auth.twoFactor.otpSentTo, displayEmail]);

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

  if (!isOtpSent) {
    return (
      <div className="grid gap-4">
        <Button
          className="w-full"
          disabled={isSending}
          onClick={handleSendOtp}
          type="button"
        >
          {isSending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />{" "}
              {dict.auth.twoFactor.sendOtpButton}
            </>
          )}
        </Button>
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
                description={
                  message ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {message}
                    </span>
                  ) : undefined
                }
                id="email-otp-code"
                inputMode="numeric"
                label={dict.auth.twoFactor.otpCodeLabel}
                maxLength={6}
                placeholder={dict.auth.twoFactor.otpCodePlaceholder}
                type="text"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {dict.auth.twoFactor.validateOtpButton}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
