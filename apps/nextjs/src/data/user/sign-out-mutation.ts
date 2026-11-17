import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";
import { getQueryClient } from "~/data/query-client";

export async function signOut() {
  const { data, error } = await authClient.signOut();
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type SignOutData = Awaited<ReturnType<typeof signOut>>;

export const useSignOutMutation = () => {
  const { t } = useTranslation();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: signOut,
    onError: (error) => {
      toast.error(error.message || t("dashboard.user.signOutFailed"));
    },
    onSettled: () => {
      queryClient.clear();
    },
    onSuccess: () => {
      toast.success(t("dashboard.user.signOutSuccess"));
    },
  });
};
