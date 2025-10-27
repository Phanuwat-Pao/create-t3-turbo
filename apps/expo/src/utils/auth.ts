import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import {
  adminClient,
  deviceAuthorizationClient,
  lastLoginMethodClient,
  multiSessionClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getBaseUrl } from "./base-url";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    expoClient({
      scheme: "expo",
      storagePrefix: "expo",
      storage: SecureStore,
    }),
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        // window.location.href = "/two-factor";
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
});
