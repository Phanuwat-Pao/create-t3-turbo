export const organizationKeys = {
  all: () => ["organization"] as const,
  detail: () => [...organizationKeys.all(), "detail"] as const,
  invitationDetail: (id: string) =>
    [...organizationKeys.all(), "invitation", id] as const,
  list: () => [...organizationKeys.all(), "list"] as const,
};
