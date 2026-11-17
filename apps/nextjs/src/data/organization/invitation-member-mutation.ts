import type { OrganizationRole } from "@acme/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

import { organizationKeys } from "./keys";

export interface InviteMemberParams {
  email: string;
  role: OrganizationRole;
}

export async function inviteMember(params: InviteMemberParams) {
  const { data, error } = await authClient.organization.inviteMember({
    email: params.email,
    role: params.role,
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const useInviteMemberMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteMember,
    onError: (error) => {
      toast.error(error.message || t("organization.invite.failed"));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(),
      });
      toast.success(t("organization.invite.success"));
    },
  });
};
