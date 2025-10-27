import { convexClient } from "@convex-dev/better-auth/client/plugins";
import {
  adminClient,
  deviceAuthorizationClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  multiSessionClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

import type { auth } from "@acme/convex/betterAuth/auth.js";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    passkeyClient(),
    adminClient(),
    multiSessionClient(),
    // oneTapClient({
    //   clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    //   promptOptions: {
    //     maxAttempts: 1,
    //   },
    // }),
    // oidcClient(),
    // genericOAuthClient(),
    // stripeClient({
    //   subscription: true,
    // }),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
    convexClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export type AuthClient = typeof authClient;
export type Session = (typeof authClient)["$Infer"]["Session"];
export type ActiveOrganization =
  (typeof authClient)["$Infer"]["ActiveOrganization"];

export type Invitation = (typeof authClient)["$Infer"]["Invitation"];
