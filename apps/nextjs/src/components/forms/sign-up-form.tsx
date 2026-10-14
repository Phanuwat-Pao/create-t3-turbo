"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { uploadFile } from "~/data/storage/upload-file";

interface SignUpFormProps {
  onSuccess?: () => void;
  callbackURL?: string;
}

export function SignUpForm({
  onSuccess,
  callbackURL = "/dashboard",
}: SignUpFormProps) {
  const { t } = useTranslation();
  const signUpSchema = z
    .object({
      email: z.email(t("validation.emailRequired")),
      firstName: z.string().min(1, t("validation.firstNameRequired")),
      image: z.file().nullable(),
      lastName: z.string().min(1, t("validation.lastNameRequired")),
      password: z.string().min(8, t("validation.passwordMinLength")),
      passwordConfirmation: z
        .string()
        .min(1, t("validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t("validation.passwordsDoNotMatch"),
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
            toast.success(t("auth.signUp.successMessage"));
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
                  label={t("auth.signUp.firstNameLabel")}
                  placeholder={t("auth.signUp.firstNamePlaceholder")}
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  autoComplete="family-name"
                  id="sign-up-last-name"
                  label={t("auth.signUp.lastNameLabel")}
                  placeholder={t("auth.signUp.lastNamePlaceholder")}
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                id="sign-up-email"
                label={t("auth.signUp.emailLabel")}
                placeholder={t("auth.signUp.emailPlaceholder")}
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
                  label={t("auth.signUp.passwordLabel")}
                  placeholder={t("auth.signUp.passwordPlaceholder")}
                  type="password"
                />
              )}
            </form.AppField>
            <form.AppField name="passwordConfirmation">
              {(field) => (
                <field.TextField
                  autoComplete="new-password"
                  id="sign-up-password-confirmation"
                  label={t("auth.signUp.confirmPasswordLabel")}
                  placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
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
                label={t("auth.signUp.profileImageLabel")}
                previewAlt={t("auth.signUp.profileImageAlt")}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton className="w-full">
          {t("auth.signUp.createAccountButton")}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
