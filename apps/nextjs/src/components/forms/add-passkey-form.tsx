"use client";

import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";

interface AddPasskeyFormProps {
  dict: Dictionary;
  label: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export function AddPasskeyForm({
  dict,
  label,
  onSuccess,
  placeholder,
}: AddPasskeyFormProps) {
  const addPasskeySchema = z.object({
    name: z.string().trim().min(1, dict.dashboard.passkeys.nameRequired),
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ formApi, value }) => {
      const res = await authClient.passkey.addPasskey({ name: value.name });
      if (res?.error) {
        toast.error(String(res.error.message));
        return;
      }
      toast.success(dict.dashboard.passkeys.addedSuccess);
      formApi.reset();
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: addPasskeySchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="grid gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              id="passkey-name"
              label={label}
              placeholder={placeholder}
            />
          )}
        </form.AppField>
        <form.SubmitButton className="w-full">
          <Fingerprint className="mr-2 h-4 w-4" />
          {dict.dashboard.passkeys.createButton}
        </form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}
