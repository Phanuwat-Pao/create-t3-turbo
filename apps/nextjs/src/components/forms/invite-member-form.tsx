"use client";

import type { OrganizationRole } from "@acme/auth";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import * as z from "zod";

import type { Dictionary } from "~/i18n/get-dictionary";

import { useInviteMemberMutation } from "~/data/organization/invitation-member-mutation";

const ORGANIZATION_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
} as const satisfies Record<string, OrganizationRole>;

interface InviteMemberFormValues {
  email: string;
  role: "admin" | "member";
}
type FormErrors = Partial<
  Record<keyof InviteMemberFormValues, { message: string }>
>;

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

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [errors, setErrors] = useState<FormErrors>({});

  const inviteMemberSchema = z.object({
    email: z.string().email(dict.validation.emailRequired),
    role: z.enum(["admin", "member"], {
      message: dict.validation.roleRequired,
    }),
  });

  const validate = useCallback((): boolean => {
    const result = inviteMemberSchema.safeParse({ email, role });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof InviteMemberFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [email, role, inviteMemberSchema]);

  const resetForm = useCallback(() => {
    setEmail("");
    setRole("member");
    setErrors({});
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      inviteMutation.mutate(
        {
          email,
          role: role as OrganizationRole,
        },
        {
          onError: (error) => {
            onError?.(error.message);
          },
          onSuccess: () => {
            resetForm();
            onSuccess?.();
          },
        }
      );
    },
    [email, inviteMutation, onError, onSuccess, resetForm, role, validate]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    []
  );

  const handleRoleChange = useCallback((value: string) => {
    setRole(value as "admin" | "member");
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="invite-email">
            {dict.organization.invite.emailLabel}
          </FieldLabel>
          <Input
            id="invite-email"
            type="email"
            placeholder={dict.organization.invite.emailPlaceholder}
            disabled={inviteMutation.isPending}
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>

        <Field data-invalid={!!errors.role}>
          <FieldLabel htmlFor="invite-role">
            {dict.organization.invite.roleLabel}
          </FieldLabel>
          <Select
            value={role}
            onValueChange={handleRoleChange}
            disabled={inviteMutation.isPending}
          >
            <SelectTrigger id="invite-role">
              <SelectValue
                placeholder={dict.organization.invite.rolePlaceholder}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ORGANIZATION_ROLES.ADMIN}>
                {dict.organization.admin}
              </SelectItem>
              <SelectItem value={ORGANIZATION_ROLES.MEMBER}>
                {dict.organization.member}
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <FieldError errors={[errors.role]} />}
        </Field>

        <Button type="submit" disabled={inviteMutation.isPending}>
          {inviteMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            dict.organization.invite.inviteButton
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
