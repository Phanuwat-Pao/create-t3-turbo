"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { uploadFile } from "~/data/storage/upload-file";
import type { Dictionary } from "~/i18n/get-dictionary";

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
  const signUpSchema = z
    .object({
      email: z.email(dict.validation.emailRequired),
      firstName: z.string().min(1, dict.validation.firstNameRequired),
      image: z.file().nullable(),
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

  const form = useAppForm({
    defaultValues: {
      email: "",
      firstName: "",
      image: null as File | null,
      lastName: "",
      password: "",
      passwordConfirmation: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email({
        callbackURL,
        email: value.email,
        fetchOptions: {
          onError: (ctx: { error: { message: string } }) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            if (value.image) {
              try {
                const result = await uploadFile(value.image);
                await authClient.updateUser({ image: result.key });
              } catch {
                // Sign-up succeeded but avatar upload failed. Non-blocking.
              }
            }
            toast.success(dict.auth.signUp.successMessage);
            onSuccess?.();
          },
        },
        image: "",
        name: `${value.firstName} ${value.lastName}`,
        password: value.password,
      });
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: signUpSchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="grid gap-2">
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="firstName">
              {(field) => (
                <field.TextField
                  autoComplete="given-name"
                  id="sign-up-first-name"
                  label={dict.auth.signUp.firstNameLabel}
                  placeholder={dict.auth.signUp.firstNamePlaceholder}
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  autoComplete="family-name"
                  id="sign-up-last-name"
                  label={dict.auth.signUp.lastNameLabel}
                  placeholder={dict.auth.signUp.lastNamePlaceholder}
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                id="sign-up-email"
                label={dict.auth.signUp.emailLabel}
                placeholder={dict.auth.signUp.emailPlaceholder}
                type="email"
              />
            )}
          </form.AppField>
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  autoComplete="new-password"
                  id="sign-up-password"
                  label={dict.auth.signUp.passwordLabel}
                  placeholder={dict.auth.signUp.passwordPlaceholder}
                  type="password"
                />
              )}
            </form.AppField>
            <form.AppField name="passwordConfirmation">
              {(field) => (
                <field.TextField
                  autoComplete="new-password"
                  id="sign-up-password-confirmation"
                  label={dict.auth.signUp.confirmPasswordLabel}
                  placeholder={dict.auth.signUp.confirmPasswordPlaceholder}
                  type="password"
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="image">
            {(field) => (
              <field.FileField
                accept="image/*"
                id="sign-up-image"
                label={dict.auth.signUp.profileImageLabel}
                previewAlt={dict.auth.signUp.profileImageAlt}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {dict.auth.signUp.createAccountButton}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
