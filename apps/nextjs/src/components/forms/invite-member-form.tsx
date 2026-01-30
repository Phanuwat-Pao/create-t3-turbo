"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import * as z from "zod";

import type { OrganizationRole } from "~/lib/auth";

import { Button } from "@acme/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { useInviteMemberMutation } from "~/data/organization/invitation-member-mutation";

const ORGANIZATION_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
} as const satisfies Record<string, OrganizationRole>;

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"], {
    message: "Please select a role",
  }),
});

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
type FormErrors = Partial<
  Record<keyof InviteMemberFormValues, { message: string }>
>;

interface InviteMemberFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function InviteMemberForm({
  onSuccess,
  onError,
}: InviteMemberFormProps) {
  const inviteMutation = useInviteMemberMutation();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [errors, setErrors] = useState<FormErrors>({});

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
  }, [email, role]);

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
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input
            id="invite-email"
            type="email"
            placeholder="member@example.com"
            disabled={inviteMutation.isPending}
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>

        <Field data-invalid={!!errors.role}>
          <FieldLabel htmlFor="invite-role">Role</FieldLabel>
          <Select
            value={role}
            onValueChange={handleRoleChange}
            disabled={inviteMutation.isPending}
          >
            <SelectTrigger id="invite-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ORGANIZATION_ROLES.ADMIN}>Admin</SelectItem>
              <SelectItem value={ORGANIZATION_ROLES.MEMBER}>Member</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <FieldError errors={[errors.role]} />}
        </Field>

        <Button type="submit" disabled={inviteMutation.isPending}>
          {inviteMutation.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            "Invite"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
