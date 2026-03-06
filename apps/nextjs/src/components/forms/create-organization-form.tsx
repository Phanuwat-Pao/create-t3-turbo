"use client";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import * as z from "zod";

import { useOrganizationCreateMutation } from "~/data/organization/organization-create-mutation";
import { useImagePreview } from "~/hooks/use-image-preview";
import type { Dictionary } from "~/i18n/get-dictionary";
import { convertImageToBase64 } from "~/lib/utils";

interface CreateOrganizationFormValues {
  name: string;
  slug: string;
}
type FormErrors = Partial<
  Record<keyof CreateOrganizationFormValues, { message: string }>
>;

interface CreateOrganizationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  dict: Dictionary;
}

export function CreateOrganizationForm({
  onSuccess,
  onError,
  dict,
}: CreateOrganizationFormProps) {
  const createMutation = useOrganizationCreateMutation();
  const { image, imagePreview, handleImageChange, clearImage } =
    useImagePreview();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const slugManuallyEdited = useRef(false);

  const createOrganizationSchema = z.object({
    name: z
      .string()
      .min(2, dict.validation.nameMinLength)
      .max(50, dict.validation.nameMaxLength),
    slug: z
      .string()
      .min(2, dict.validation.slugMinLength)
      .max(50, dict.validation.slugMaxLength)
      .regex(/^[a-z0-9-]+$/, dict.validation.slugInvalidChars),
  });

  // Auto-generate slug from name if slug hasn't been manually edited
  useEffect(() => {
    if (!slugManuallyEdited.current) {
      const generatedSlug = name
        .trim()
        .toLowerCase()
        .replaceAll(/\s+/g, "-")
        .replaceAll(/[^a-z0-9-]/g, "");
      setSlug(generatedSlug);
    }
  }, [name]);

  const validate = useCallback((): boolean => {
    const result = createOrganizationSchema.safeParse({ name, slug });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateOrganizationFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [name, slug, createOrganizationSchema]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      try {
        const logoBase64 = image
          ? await convertImageToBase64(image)
          : undefined;

        createMutation.mutate(
          {
            logo: logoBase64,
            name,
            slug,
          },
          {
            onError: (error) => {
              onError?.(error.message);
            },
            onSuccess: () => {
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
    [createMutation, image, name, onError, onSuccess, slug, validate, dict]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
    },
    []
  );

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      slugManuallyEdited.current = true;
      setSlug(e.target.value);
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="org-name">
            {dict.organization.create.nameLabel}
          </FieldLabel>
          <Input
            id="org-name"
            placeholder={dict.organization.create.namePlaceholder}
            disabled={createMutation.isPending}
            value={name}
            onChange={handleNameChange}
          />
          {errors.name && <FieldError errors={[errors.name]} />}
        </Field>

        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="org-slug">
            {dict.organization.create.slugLabel}
          </FieldLabel>
          <Input
            id="org-slug"
            placeholder={dict.organization.create.slugPlaceholder}
            disabled={createMutation.isPending}
            value={slug}
            onChange={handleSlugChange}
          />
          {errors.slug && <FieldError errors={[errors.slug]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="org-logo">
            {dict.organization.create.logoLabel}
          </FieldLabel>
          <div className="flex items-end gap-4">
            {imagePreview && (
              <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                <Image
                  src={imagePreview}
                  alt={dict.organization.create.logoAlt}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex w-full items-center gap-2">
              <Input
                id="org-logo"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={createMutation.isPending}
                className="text-muted-foreground w-full"
              />
              {imagePreview && (
                <X
                  className="cursor-pointer"
                  onClick={clearImage}
                  aria-label="Clear logo"
                />
              )}
            </div>
          </div>
        </Field>

        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            dict.organization.create.createButton
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
