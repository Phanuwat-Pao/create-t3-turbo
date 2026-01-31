"use client";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { PasswordInput } from "@acme/ui/password-input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import * as z from "zod";

import type { Dictionary } from "~/i18n/get-dictionary";

import { authClient } from "~/auth/client";

import { LastUsedIndicator } from "../last-used-indicator";

type SignInFormErrors = Partial<
  Record<"email" | "password" | "rememberMe", { message: string }>
>;

interface SignInFormProps {
  onSuccess?: () => void;
  callbackURL?: string;
  showPasswordToggle?: boolean;
  dict: Dictionary;
}

export function SignInForm({
  onSuccess,
  callbackURL = "/dashboard",
  showPasswordToggle = false,
  dict,
}: SignInFormProps) {
  const [loading, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<SignInFormErrors>({});

  const signInSchema = z.object({
    email: z.string().email(dict.validation.emailRequired),
    password: z.string().min(1, dict.validation.passwordRequired),
    rememberMe: z.boolean(),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validate = useCallback((): boolean => {
    const result = signInSchema.safeParse({ email, password, rememberMe });
    if (!result.success) {
      const fieldErrors: SignInFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignInFormErrors;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [email, password, rememberMe, signInSchema]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        await authClient.signIn.email(
          {
            callbackURL,
            email,
            password,
            rememberMe,
          },
          {
            onError(context: { error: { message: string } }) {
              toast.error(context.error.message);
            },
            onSuccess() {
              toast.success(dict.auth.signIn.successMessage);
              onSuccess?.();
            },
          }
        );
      });
    },
    [validate, callbackURL, email, password, rememberMe, onSuccess, dict]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    []
  );

  const handleRememberMeChange = useCallback(
    (checked: boolean | "indeterminate") => setRememberMe(checked === true),
    []
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="sign-in-email">
            {dict.auth.signIn.emailLabel}
          </FieldLabel>
          <Input
            id="sign-in-email"
            type="email"
            placeholder={dict.auth.signIn.emailPlaceholder}
            aria-invalid={!!errors.email}
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center">
            <FieldLabel htmlFor="sign-in-password">
              {dict.auth.signIn.passwordLabel}
            </FieldLabel>
            <Link
              href="/forget-password"
              className="text-foreground ml-auto inline-block text-sm underline"
            >
              {dict.auth.signIn.forgotPassword}
            </Link>
          </div>
          {showPasswordToggle ? (
            <PasswordInput
              id="sign-in-password"
              placeholder={dict.auth.signIn.passwordPlaceholder}
              aria-invalid={!!errors.password}
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
            />
          ) : (
            <Input
              id="sign-in-password"
              type="password"
              placeholder={dict.auth.signIn.passwordPlaceholder}
              aria-invalid={!!errors.password}
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
            />
          )}
          {errors.password && <FieldError errors={[errors.password]} />}
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="sign-in-remember"
            checked={rememberMe}
            onCheckedChange={handleRememberMeChange}
          />
          <FieldLabel htmlFor="sign-in-remember" className="font-normal">
            {dict.auth.signIn.rememberMe}
          </FieldLabel>
        </Field>
      </FieldGroup>
      <Button type="submit" className="relative w-full" disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          dict.auth.signIn.loginButton
        )}
        {isMounted && authClient.isLastUsedLoginMethod("email") && (
          <LastUsedIndicator />
        )}
      </Button>
    </form>
  );
}
