import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";
import { getQueryClient } from "~/data/query-client";

import { organizationKeys } from "./keys";

export interface InviteRejectParams {
  invitationId: string;
}

export async function inviteReject(params: InviteRejectParams) {
  const { data, error } = await authClient.organization.rejectInvitation({
    invitationId: params.invitationId,
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type InviteRejectData = Awaited<ReturnType<typeof inviteReject>>;

export const useInviteRejectMutation = () => {
  const { t } = useTranslation();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: inviteReject,
    onError: (error) => {
      toast.error(error.message || t("organization.invitation.rejectFailed"));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.all(),
      });
      toast.success(t("organization.invitation.rejectSuccess"));
    },
  });
};
