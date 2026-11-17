"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as z from "zod";

import { uploadErrorMessage } from "~/data/storage/upload-error-message";
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
      let imageKey: string | undefined;
      if (value.image) {
        try {
          const result = await uploadFile(value.image);
          imageKey = result.key;
        } catch (error) {
          const message = uploadErrorMessage(error, t);
          toast.error(message);
          onError?.(message);
          return;
        }
      }
      try {
        await updateUserMutation.mutateAsync({
          image: imageKey,
          name: value.name || undefined,
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
                clearLabel={t("dashboard.user.clearImage")}
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
