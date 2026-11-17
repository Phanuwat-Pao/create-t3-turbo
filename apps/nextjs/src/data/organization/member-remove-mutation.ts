import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

import { organizationKeys } from "./keys";

export interface MemberRemoveParams {
  memberIdOrEmail: string;
}

export async function removeMember(params: MemberRemoveParams) {
  const { data, error } = await authClient.organization.removeMember({
    memberIdOrEmail: params.memberIdOrEmail,
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const useMemberRemoveMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMember,
    onError: (error) => {
      toast.error(error.message || t("organization.removeMemberFailed"));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(),
      });
      toast.success(t("organization.removeMemberSuccess"));
    },
  });
};
