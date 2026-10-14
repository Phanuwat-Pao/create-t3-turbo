"use client";

import type { OrganizationRole } from "@acme/auth";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm, useStore } from "@acme/ui/form";
import { SelectItem } from "@acme/ui/select";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { useInviteMemberMutation } from "~/data/organization/invitation-member-mutation";

const ORGANIZATION_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
} as const satisfies Record<string, OrganizationRole>;

type InviteRole = (typeof ORGANIZATION_ROLES)[keyof typeof ORGANIZATION_ROLES];

interface InviteMemberFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function InviteMemberForm({
  onSuccess,
  onError,
}: InviteMemberFormProps) {
  const { t } = useTranslation();
  const inviteMutation = useInviteMemberMutation();

  const inviteMemberSchema = z.object({
    email: z.email(t("validation.emailRequired")),
    role: z.enum([ORGANIZATION_ROLES.ADMIN, ORGANIZATION_ROLES.MEMBER], {
      message: t("validation.roleRequired"),
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
        onError?.(error instanceof Error ? error.message : t("common.error"));
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
                label={t("organization.invite.emailLabel")}
                placeholder={t("organization.invite.emailPlaceholder")}
                type="email"
              />
            )}
          </form.AppField>

          <form.AppField name="role">
            {(field) => (
              <field.SelectField
                disabled={isSubmitting}
                id="invite-role"
                label={t("organization.invite.roleLabel")}
                placeholder={t("organization.invite.rolePlaceholder")}
              >
                <SelectItem value={ORGANIZATION_ROLES.ADMIN}>
                  {t("organization.admin")}
                </SelectItem>
                <SelectItem value={ORGANIZATION_ROLES.MEMBER}>
                  {t("organization.member")}
                </SelectItem>
              </field.SelectField>
            )}
          </form.AppField>

          <form.SubmitButton>
            {t("organization.invite.inviteButton")}
          </form.SubmitButton>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  );
}
