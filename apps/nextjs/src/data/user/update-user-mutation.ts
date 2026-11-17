import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

import { userKeys } from "./keys";

interface UpdateUserParams {
  name?: string;
  image?: string;
}

export async function updateUser(params: UpdateUserParams) {
  const { data, error } = await authClient.updateUser(params);
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type UpdateUserData = Awaited<ReturnType<typeof updateUser>>;

export const useUpdateUserMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onError: (error: any) => {
      toast.error(error.message || t("dashboard.user.updateFailed"));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.session(),
      });
      toast.success(t("dashboard.user.updateSuccess"));
    },
  });
};
