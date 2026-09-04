"use client";

import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import * as z from "zod";

import { uploadFile } from "~/data/storage/upload-file";
import { useUpdateUserMutation } from "~/data/user/update-user-mutation";
import type { Dictionary } from "~/i18n/get-dictionary";

interface UpdateUserFormProps {
  currentName?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  dict: Dictionary;
}

export function UpdateUserForm({
  currentName,
  onSuccess,
  onError,
  dict,
}: UpdateUserFormProps) {
  const updateUserMutation = useUpdateUserMutation();

  const updateUserSchema = z.object({
    image: z.file().nullable(),
    name: z.union([
      z.literal(""),
      z
        .string()
        .min(2, dict.validation.nameMinLength)
        .max(50, dict.validation.nameMaxLength),
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
            : dict.validation.failedToProcessImage
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
                label={dict.dashboard.user.fullNameLabel}
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
                label={dict.dashboard.user.profileImageLabel}
                previewAlt={dict.dashboard.user.profileImageAlt}
              />
            )}
          </form.AppField>

          <form.SubmitButton disabled={isEmpty}>
            {dict.dashboard.user.updateButton}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
