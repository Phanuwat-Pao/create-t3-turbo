import { getToken as getTokenNextjs } from "@convex-dev/better-auth/nextjs";

import { createAuth } from "@acme/convex/auth.js";

export const getToken = () => {
  return getTokenNextjs(createAuth);
};
