import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { ssoClient } from "@better-auth/sso/client";
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
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getI18n } from "react-i18next";
import { toast } from "sonner";

import { env } from "~/env";
import { toLocale, withLocale } from "~/i18n/localized-path";

import type { auth } from "./server";

export const authClient = createAuthClient({
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        // The root layout's I18nProvider registers its i18next instance with
        // react-i18next and switches its language with the route, so this
        // resolves to the page's language when the toast fires.
        toast.error(getI18n().t("common.tooManyRequests"));
      }
    },
  },
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = withLocale(
          "/two-factor",
          toLocale(window.location.pathname.split("/")[1])
        );
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
    ssoClient(),
    usernameClient(),
  ],
});
