"use client";

import type { AdminUserSort } from "@acme/validators/admin";
import { pageOffset } from "@acme/validators/paging";
import { useQuery } from "@tanstack/react-query";

import { authClient } from "~/auth/client";

import { adminKeys, type PageQuery } from "./keys";

export type UserListInput = PageQuery<AdminUserSort>;

/**
 * One page of Better Auth users, sorted and searched on the server. Better
 * Auth's admin plugin pages by limit and offset, so the page number becomes
 * an offset here. It searches one field: the email when the search has an
 * `@`, otherwise the name.
 */
export async function listUsers(input: UserListInput) {
  const search = input.search
    ? {
        searchField: input.search.includes("@")
          ? ("email" as const)
          : ("name" as const),
        searchOperator: "contains" as const,
        searchValue: input.search,
      }
    : {};
  const data = await authClient.admin.listUsers(
    {
      query: {
        limit: input.pageSize,
        offset: pageOffset(input),
        sortBy: input.sort.id,
        sortDirection: input.sort.desc ? "desc" : "asc",
        ...search,
      },
    },
    { throw: true }
  );
  return { rows: data.users, total: data.total };
}

export const useUserListQuery = (input: UserListInput) =>
  useQuery({
    // Keep the last page on screen while the next one loads.
    placeholderData: (previous) => previous,
    queryFn: () => listUsers(input),
    queryKey: adminKeys.userPage(input),
  });
