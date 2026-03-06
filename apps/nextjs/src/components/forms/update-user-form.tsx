"use client";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import * as z from "zod";

import { useUpdateUserMutation } from "~/data/user/update-user-mutation";
import { useImagePreview } from "~/hooks/use-image-preview";
import type { Dictionary } from "~/i18n/get-dictionary";
import { convertImageToBase64 } from "~/lib/utils";

interface UpdateUserFormValues {
  name: string;
}
type FormErrors = Partial<
  Record<keyof UpdateUserFormValues, { message: string }>
>;

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
  const { image, imagePreview, handleImageChange, clearImage } =
    useImagePreview();

  const [name, setName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const updateUserSchema = z.object({
    name: z
      .string()
      .min(2, dict.validation.nameMinLength)
      .max(50, dict.validation.nameMaxLength)
      .optional()
      .or(z.literal("")),
  });

  const validate = useCallback((): boolean => {
    const result = updateUserSchema.safeParse({ name });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof UpdateUserFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [name, updateUserSchema]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      try {
        const imageBase64 = image
          ? await convertImageToBase64(image)
          : undefined;

        updateUserMutation.mutate(
          {
            image: imageBase64,
            name: name || undefined,
          },
          {
            onError: (error) => {
              onError?.(error.message);
            },
            onSuccess: () => {
              setName("");
              clearImage();
              onSuccess?.();
            },
          }
        );
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error.message
            : dict.validation.failedToProcessImage
        );
      }
    },
    [
      validate,
      image,
      updateUserMutation,
      name,
      onError,
      clearImage,
      onSuccess,
      dict,
    ]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">
            {dict.dashboard.user.fullNameLabel}
          </FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder={currentName}
            disabled={updateUserMutation.isPending}
            value={name}
            onChange={handleNameChange}
          />
          {errors.name && <FieldError errors={[errors.name]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="image">
            {dict.dashboard.user.profileImageLabel}
          </FieldLabel>
          <div className="flex items-end gap-4">
            {imagePreview && (
              <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                <Image
                  src={imagePreview}
                  alt={dict.dashboard.user.profileImageAlt}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex w-full items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={updateUserMutation.isPending}
                className="text-muted-foreground w-full"
              />
              {imagePreview && (
                <X
                  className="cursor-pointer"
                  onClick={clearImage}
                  aria-label="Clear image"
                />
              )}
            </div>
          </div>
        </Field>

        <Button
          type="submit"
          disabled={updateUserMutation.isPending || (!image && !name)}
        >
          {updateUserMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            dict.dashboard.user.updateButton
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
