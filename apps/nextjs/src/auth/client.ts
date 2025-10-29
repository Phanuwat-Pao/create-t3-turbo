import { convexClient } from "@convex-dev/better-auth/client/plugins";
import {
  adminClient,
  deviceAuthorizationClient,
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  oneTimeTokenClient,
  organizationClient,
  passkeyClient,
  phoneNumberClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

import type { auth } from "@acme/convex/betterAuth/auth";

import { env } from "~/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),

    magicLinkClient(),
    emailOTPClient(),
    usernameClient(),
    phoneNumberClient(),
    oneTimeTokenClient(),

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
    genericOAuthClient(),
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
export type Session = AuthClient["$Infer"]["Session"];
export type ActiveOrganization = AuthClient["$Infer"]["ActiveOrganization"];
export type Invitation = AuthClient["$Infer"]["Invitation"];
