import { expoClient } from "@better-auth/expo/client";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  organizationClient,
  multiSessionClient,
  deviceAuthorizationClient,
  lastLoginMethodClient,
  magicLinkClient,
  emailOTPClient,
  usernameClient,
  phoneNumberClient,
  oneTimeTokenClient,
  genericOAuthClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { getBaseUrl } from "./base-url";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
      storagePrefix: Constants.expoConfig?.scheme as string,
    }),
    organizationClient(),
    // twoFactorClient({
    //   onTwoFactorRedirect() {
    //     window.location.href = "/two-factor";
    //   },
    // }),
    adminClient(),
    multiSessionClient(),
    // oneTapClient({
    //   clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    //   promptOptions: {
    //     maxAttempts: 1,
    //   },
    // }),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
    passkeyClient(),
    oauthProviderClient(),
    magicLinkClient(),
    emailOTPClient(),
    usernameClient(),
    phoneNumberClient(),
    oneTimeTokenClient(),
    genericOAuthClient(),
  ],
});
