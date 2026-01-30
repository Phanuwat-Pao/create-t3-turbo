import { useQuery } from "@tanstack/react-query";

import { authClient } from "~/auth/client";

import { organizationKeys } from "./keys";

export async function getOrganizationList() {
  const { data, error } = await authClient.organization.list();
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type OrganizationListData = Awaited<
  ReturnType<typeof getOrganizationList>
>;

export const useOrganizationListQuery = () =>
  useQuery({
    queryFn: getOrganizationList,
    queryKey: organizationKeys.list(),
  });
