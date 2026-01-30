import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

export async function upgradeSubscription(plan: string) {
  const { data, error } = await authClient.subscription.upgrade({
    cancelUrl: "/dashboard",
    plan,
    returnUrl: "/dashboard",
    successUrl: "/dashboard",
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type SubscriptionUpgradeData = Awaited<
  ReturnType<typeof upgradeSubscription>
>;

export const useSubscriptionUpgradeMutation = () =>
  useMutation({
    mutationFn: upgradeSubscription,
    onError: (error) => {
      toast.error(error.message || "Failed to upgrade plan");
    },
  });
