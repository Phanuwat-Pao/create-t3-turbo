"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import * as z from "zod";

import { useOrganizationCreateMutation } from "~/data/organization/organization-create-mutation";
import { uploadFile } from "~/data/storage/upload-file";
import type { Dictionary } from "~/i18n/get-dictionary";

interface CreateOrganizationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  dict: Dictionary;
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
  dict,
}: CreateOrganizationFormProps) {
  const createMutation = useOrganizationCreateMutation();

  const createOrganizationSchema = z.object({
    logo: z.file().nullable(),
    name: z
      .string()
      .min(2, dict.validation.nameMinLength)
      .max(50, dict.validation.nameMaxLength),
    slug: z
      .string()
      .min(2, dict.validation.slugMinLength)
      .max(50, dict.validation.slugMaxLength)
      .regex(/^[a-z0-9-]+$/u, dict.validation.slugInvalidChars),
  });

  const form = useAppForm({
    defaultValues: {
      logo: null as File | null,
      name: "",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      try {
        let logoKey: string | undefined;
        if (value.logo) {
          const result = await uploadFile(value.logo);
          logoKey = result.key;
        }
        await createMutation.mutateAsync({
          logo: logoKey,
          name: value.name,
          slug: value.slug,
        });
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : dict.validation.failedToProcessImage
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
                label={dict.organization.create.nameLabel}
                placeholder={dict.organization.create.namePlaceholder}
              />
            )}
          </form.AppField>

          <form.AppField name="slug">
            {(field) => (
              <field.TextField
                disabled={isSubmitting}
                id="org-slug"
                label={dict.organization.create.slugLabel}
                placeholder={dict.organization.create.slugPlaceholder}
              />
            )}
          </form.AppField>

          <form.AppField name="logo">
            {(field) => (
              <field.FileField
                accept="image/*"
                className="text-muted-foreground"
                clearLabel="Clear logo"
                disabled={isSubmitting}
                id="org-logo"
                label={dict.organization.create.logoLabel}
                previewAlt={dict.organization.create.logoAlt}
              />
            )}
          </form.AppField>

          <form.SubmitButton>
            {dict.organization.create.createButton}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
