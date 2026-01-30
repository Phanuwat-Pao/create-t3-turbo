import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  customSessionClient,
  deviceAuthorizationClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

import { env } from "~/env";

import type { auth } from "./server";

export const authClient = createAuthClient({
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    adminClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    customSessionClient<typeof auth>(),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
    passkeyClient(),
    oauthProviderClient(),
  ],
});
