import type { AdminUserSort } from "@acme/validators/admin";

export interface PageQuery<Sort extends string> {
  page: number;
  pageSize: number;
  search: string | undefined;
  sort: { desc: boolean; id: Sort };
}

export const adminKeys = {
  all: () => ["admin"] as const,
  users: () => [...adminKeys.all(), "users"] as const,
  userPage: (input: PageQuery<AdminUserSort>) =>
    [...adminKeys.users(), input] as const,
};
