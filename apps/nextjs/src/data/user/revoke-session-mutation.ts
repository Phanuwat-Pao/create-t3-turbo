import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

import { userKeys } from "./keys";

interface RevokeSessionParams {
  token: string;
}

export async function revokeSession(params: RevokeSessionParams) {
  const { data, error } = await authClient.revokeSession(params);
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type RevokeSessionData = Awaited<ReturnType<typeof revokeSession>>;

export const useRevokeSessionMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onError: (error) => {
      toast.error(error.message || t("dashboard.sessions.terminateFailed"));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.session(),
      });
      toast.success(t("dashboard.sessions.terminateSuccess"));
    },
  });
};
