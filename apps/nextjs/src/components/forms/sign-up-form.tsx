"use client";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Loader2, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { useImagePreview } from "~/hooks/use-image-preview";
import type { Dictionary } from "~/i18n/get-dictionary";
import { convertImageToBase64 } from "~/lib/utils";

type SignUpFormErrors = Partial<
  Record<
    "email" | "firstName" | "lastName" | "password" | "passwordConfirmation",
    { message: string }
  >
>;

interface SignUpFormProps {
  onSuccess?: () => void;
  callbackURL?: string;
  dict: Dictionary;
}

export function SignUpForm({
  onSuccess,
  callbackURL = "/dashboard",
  dict,
}: SignUpFormProps) {
  const [loading, startTransition] = useTransition();
  const { image, imagePreview, handleImageChange, clearImage } =
    useImagePreview();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<SignUpFormErrors>({});

  const signUpSchema = z
    .object({
      email: z.string().email(dict.validation.emailRequired),
      firstName: z.string().min(1, dict.validation.firstNameRequired),
      lastName: z.string().min(1, dict.validation.lastNameRequired),
      password: z.string().min(8, dict.validation.passwordMinLength),
      passwordConfirmation: z
        .string()
        .min(1, dict.validation.confirmPasswordRequired),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: dict.validation.passwordsDoNotMatch,
      path: ["passwordConfirmation"],
    });

  const validate = useCallback((): boolean => {
    const result = signUpSchema.safeParse({
      email,
      firstName,
      lastName,
      password,
      passwordConfirmation,
    });
    if (!result.success) {
      const fieldErrors: SignUpFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormErrors;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [
    email,
    firstName,
    lastName,
    password,
    passwordConfirmation,
    signUpSchema,
  ]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        await authClient.signUp.email({
          callbackURL,
          email,
          fetchOptions: {
            onError: (ctx: { error: { message: string } }) => {
              toast.error(ctx.error.message);
            },
            onSuccess: async () => {
              toast.success(dict.auth.signUp.successMessage);
              onSuccess?.();
            },
          },
          image: image ? await convertImageToBase64(image) : "",
          name: `${firstName} ${lastName}`,
          password,
        });
      });
    },
    [
      validate,
      callbackURL,
      email,
      image,
      firstName,
      lastName,
      password,
      onSuccess,
      dict,
    ]
  );

  const handleFirstNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value),
    []
  );

  const handleLastNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value),
    []
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    []
  );

  const handlePasswordConfirmationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPasswordConfirmation(e.target.value),
    []
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="sign-up-first-name">
              {dict.auth.signUp.firstNameLabel}
            </FieldLabel>
            <Input
              id="sign-up-first-name"
              placeholder={dict.auth.signUp.firstNamePlaceholder}
              aria-invalid={!!errors.firstName}
              autoComplete="given-name"
              value={firstName}
              onChange={handleFirstNameChange}
            />
            {errors.firstName && <FieldError errors={[errors.firstName]} />}
          </Field>
          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="sign-up-last-name">
              {dict.auth.signUp.lastNameLabel}
            </FieldLabel>
            <Input
              id="sign-up-last-name"
              placeholder={dict.auth.signUp.lastNamePlaceholder}
              aria-invalid={!!errors.lastName}
              autoComplete="family-name"
              value={lastName}
              onChange={handleLastNameChange}
            />
            {errors.lastName && <FieldError errors={[errors.lastName]} />}
          </Field>
        </div>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="sign-up-email">
            {dict.auth.signUp.emailLabel}
          </FieldLabel>
          <Input
            id="sign-up-email"
            type="email"
            placeholder={dict.auth.signUp.emailPlaceholder}
            aria-invalid={!!errors.email}
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="sign-up-password">
              {dict.auth.signUp.passwordLabel}
            </FieldLabel>
            <Input
              id="sign-up-password"
              type="password"
              placeholder={dict.auth.signUp.passwordPlaceholder}
              aria-invalid={!!errors.password}
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
            />
            {errors.password && <FieldError errors={[errors.password]} />}
          </Field>
          <Field data-invalid={!!errors.passwordConfirmation}>
            <FieldLabel htmlFor="sign-up-password-confirmation">
              {dict.auth.signUp.confirmPasswordLabel}
            </FieldLabel>
            <Input
              id="sign-up-password-confirmation"
              type="password"
              placeholder={dict.auth.signUp.confirmPasswordPlaceholder}
              aria-invalid={!!errors.passwordConfirmation}
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={handlePasswordConfirmationChange}
            />
            {errors.passwordConfirmation && (
              <FieldError errors={[errors.passwordConfirmation]} />
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="sign-up-image">
            {dict.auth.signUp.profileImageLabel}
          </FieldLabel>
          <div className="flex items-end gap-4">
            {imagePreview && (
              <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt={dict.auth.signUp.profileImageAlt}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex w-full items-center gap-2">
              <Input
                id="sign-up-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imagePreview && (
                <X className="cursor-pointer" onClick={clearImage} />
              )}
            </div>
          </div>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          dict.auth.signUp.createAccountButton
        )}
      </Button>
    </form>
  );
}
