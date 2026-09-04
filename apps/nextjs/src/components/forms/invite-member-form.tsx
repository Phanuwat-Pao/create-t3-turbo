"use client";

import type { OrganizationRole } from "@acme/auth";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import { SelectItem } from "@acme/ui/select";
import * as z from "zod";

import { useInviteMemberMutation } from "~/data/organization/invitation-member-mutation";
import type { Dictionary } from "~/i18n/get-dictionary";

const ORGANIZATION_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
} as const satisfies Record<string, OrganizationRole>;

type InviteRole = (typeof ORGANIZATION_ROLES)[keyof typeof ORGANIZATION_ROLES];

interface InviteMemberFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  dict: Dictionary;
}

export function InviteMemberForm({
  onSuccess,
  onError,
  dict,
}: InviteMemberFormProps) {
  const inviteMutation = useInviteMemberMutation();

  const inviteMemberSchema = z.object({
    email: z.email(dict.validation.emailRequired),
    role: z.enum([ORGANIZATION_ROLES.ADMIN, ORGANIZATION_ROLES.MEMBER], {
      message: dict.validation.roleRequired,
    }),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      role: ORGANIZATION_ROLES.MEMBER as InviteRole,
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await inviteMutation.mutateAsync({
          email: value.email,
          role: value.role as OrganizationRole,
        });
      } catch (error) {
        onError?.(error instanceof Error ? error.message : dict.common.error);
        return;
      }
      formApi.reset();
      onSuccess?.();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: inviteMemberSchema,
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                disabled={isSubmitting}
                id="invite-email"
                label={dict.organization.invite.emailLabel}
                placeholder={dict.organization.invite.emailPlaceholder}
                type="email"
              />
            )}
          </form.AppField>

          <form.AppField name="role">
            {(field) => (
              <field.SelectField
                disabled={isSubmitting}
                id="invite-role"
                label={dict.organization.invite.roleLabel}
                placeholder={dict.organization.invite.rolePlaceholder}
              >
                <SelectItem value={ORGANIZATION_ROLES.ADMIN}>
                  {dict.organization.admin}
                </SelectItem>
                <SelectItem value={ORGANIZATION_ROLES.MEMBER}>
                  {dict.organization.member}
                </SelectItem>
              </field.SelectField>
            )}
          </form.AppField>

          <form.SubmitButton>
            {dict.organization.invite.inviteButton}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
