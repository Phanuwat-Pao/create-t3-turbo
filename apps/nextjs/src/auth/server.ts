import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs";

import { createAuth } from "@acme/convex/auth";

export const getToken = () => {
  return getTokenNextjs(createAuth);
};
