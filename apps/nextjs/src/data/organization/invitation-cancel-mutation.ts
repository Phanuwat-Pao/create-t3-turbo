import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

import { organizationKeys } from "./keys";

export interface InvitationCancelParams {
  invitationId: string;
}

export async function cancelInvitation(params: InvitationCancelParams) {
  const { data, error } = await authClient.organization.cancelInvitation({
    invitationId: params.invitationId,
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const useInvitationCancelMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelInvitation,
    onError: (error) => {
      toast.error(error.message || t("organization.invitation.cancelFailed"));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(),
      });
      toast.success(t("organization.invitation.cancelSuccess"));
    },
  });
};
