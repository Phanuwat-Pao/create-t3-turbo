import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export async function changePassword(params: ChangePasswordParams) {
  const { data, error } = await authClient.changePassword(params);
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type ChangePasswordData = Awaited<ReturnType<typeof changePassword>>;

export const useChangePasswordMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: changePassword,
    onError: (error) => {
      toast.error(error.message || t("dashboard.changePassword.failed"));
    },
    onSuccess: () => {
      toast.success(t("dashboard.changePassword.success"));
    },
  });
};
