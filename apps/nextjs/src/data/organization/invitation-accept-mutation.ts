import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

import { organizationKeys } from "./keys";

export interface InviteAcceptParams {
  invitationId: string;
}

export async function inviteAccept(params: InviteAcceptParams) {
  const { data, error } = await authClient.organization.acceptInvitation({
    invitationId: params.invitationId,
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type InviteAcceptData = Awaited<ReturnType<typeof inviteAccept>>;

export const useInviteAcceptMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteAccept,
    onError: (error) => {
      toast.error(error.message || t("organization.invitation.acceptFailed"));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.all(),
      });
      toast.success(t("organization.invitation.acceptSuccess"));
    },
  });
};
