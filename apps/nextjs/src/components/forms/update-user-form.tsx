"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { uploadFile } from "~/data/storage/upload-file";
import { useUpdateUserMutation } from "~/data/user/update-user-mutation";

interface UpdateUserFormProps {
  currentName?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function UpdateUserForm({
  currentName,
  onSuccess,
  onError,
}: UpdateUserFormProps) {
  const { t } = useTranslation();
  const updateUserMutation = useUpdateUserMutation();

  const updateUserSchema = z.object({
    image: z.file().nullable(),
    name: z.union([
      z.literal(""),
      z
        .string()
        .min(2, t("validation.nameMinLength"))
        .max(50, t("validation.nameMaxLength")),
    ]),
  });

  const form = useAppForm({
    defaultValues: {
      image: null as File | null,
      name: "",
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        let imageKey: string | undefined;
        if (value.image) {
          const result = await uploadFile(value.image);
          imageKey = result.key;
        }
        await updateUserMutation.mutateAsync({
          image: imageKey,
          name: value.name || undefined,
        });
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : t("validation.failedToProcessImage")
        );
        return;
      }
      formApi.reset();
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateUserSchema,
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const isEmpty = useStore(
    form.store,
    (state) => !state.values.image && !state.values.name
  );

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                disabled={isSubmitting}
                id="name"
                label={t("dashboard.user.fullNameLabel")}
                placeholder={currentName}
                type="text"
              />
            )}
          </form.AppField>

          <form.AppField name="image">
            {(field) => (
              <field.FileField
                accept="image/*"
                className="text-muted-foreground"
                clearLabel="Clear image"
                disabled={isSubmitting}
                id="image"
                label={t("dashboard.user.profileImageLabel")}
                previewAlt={t("dashboard.user.profileImageAlt")}
              />
            )}
          </form.AppField>

          <form.SubmitButton disabled={isEmpty}>
            {t("dashboard.user.updateButton")}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
