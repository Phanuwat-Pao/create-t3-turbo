import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { getQueryClient } from "../query-client";

export async function signOut() {
  const { data, error } = await authClient.signOut();
  if (error) {throw new Error(error.message);}

  return data;
}
export type SignOutData = Awaited<ReturnType<typeof signOut>>;

export const useSignOutMutation = () => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: signOut,
    onError: (error) => {
      toast.error(error.message || "Failed to sign out");
    },
    onSettled: () => {
      queryClient.clear();
    },
    onSuccess: () => {
      toast.success("Successfully signed out!");
    },
  });
};
