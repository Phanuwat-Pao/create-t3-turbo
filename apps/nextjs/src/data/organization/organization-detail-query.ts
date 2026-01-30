import { useQuery } from "@tanstack/react-query";

import { authClient } from "~/auth/client";

import { organizationKeys } from "./keys";

export async function getOrganizationDetail() {
  const { data, error } = await authClient.organization.getFullOrganization();
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type OrganizationDetailData = Awaited<
  ReturnType<typeof getOrganizationDetail>
>;

export const useOrganizationDetailQuery = () =>
  useQuery({
    queryFn: getOrganizationDetail,
    queryKey: organizationKeys.detail(),
  });
