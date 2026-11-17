"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { useOrganizationCreateMutation } from "~/data/organization/organization-create-mutation";
import { uploadErrorMessage } from "~/data/storage/upload-error-message";
import { uploadFile } from "~/data/storage/upload-file";

interface CreateOrganizationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/gu, "-")
    .replaceAll(/[^a-z0-9-]/gu, "");

export function CreateOrganizationForm({
  onSuccess,
  onError,
}: CreateOrganizationFormProps) {
  const { t } = useTranslation();
  const createMutation = useOrganizationCreateMutation();

  const createOrganizationSchema = z.object({
    logo: z.file().nullable(),
    name: z
      .string()
      .min(2, t("validation.nameMinLength"))
      .max(50, t("validation.nameMaxLength")),
    slug: z
      .string()
      .min(2, t("validation.slugMinLength"))
      .max(50, t("validation.slugMaxLength"))
      .regex(/^[a-z0-9-]+$/u, t("validation.slugInvalidChars")),
  });

  const form = useAppForm({
    defaultValues: {
      logo: null as File | null,
      name: "",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      let logoKey: string | undefined;
      if (value.logo) {
        try {
          const result = await uploadFile(value.logo);
          logoKey = result.key;
        } catch (error) {
          const message = uploadErrorMessage(error, t);
          toast.error(message);
          onError?.(message);
          return;
        }
      }
      try {
        await createMutation.mutateAsync({
          logo: logoKey,
          name: value.name,
          slug: value.slug,
        });
      } catch (error) {
        // The mutation's onError has already shown a toast.
        onError?.(
          error instanceof Error
            ? error.message
            : t("validation.failedToProcessImage")
        );
        return;
      }
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createOrganizationSchema,
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <form.AppField
            listeners={{
              // Mirror the name into the slug until the user edits the slug
              // themselves; a hand-edited slug is dirty and left alone.
              onChange: ({ fieldApi, value }) => {
                if (!fieldApi.form.getFieldMeta("slug")?.isDirty) {
                  fieldApi.form.setFieldValue("slug", slugify(value), {
                    dontUpdateMeta: true,
                  });
                }
              },
            }}
            name="name"
          >
            {(field) => (
              <field.TextField
                disabled={isSubmitting}
                id="org-name"
                label={t("organization.create.nameLabel")}
                placeholder={t("organization.create.namePlaceholder")}
              />
            )}
          </form.AppField>

          <form.AppField name="slug">
            {(field) => (
              <field.TextField
                disabled={isSubmitting}
                id="org-slug"
                label={t("organization.create.slugLabel")}
                placeholder={t("organization.create.slugPlaceholder")}
              />
            )}
          </form.AppField>

          <form.AppField name="logo">
            {(field) => (
              <field.FileField
                accept="image/*"
                className="text-muted-foreground"
                clearLabel={t("organization.create.clearLogo")}
                disabled={isSubmitting}
                id="org-logo"
                label={t("organization.create.logoLabel")}
                previewAlt={t("organization.create.logoAlt")}
              />
            )}
          </form.AppField>

          <form.SubmitButton>
            {t("organization.create.createButton")}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
