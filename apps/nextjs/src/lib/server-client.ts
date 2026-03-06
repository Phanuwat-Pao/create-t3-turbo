import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client";
import { createAuthClient } from "better-auth/client";

import { auth } from "~/auth/server";

export const serverClient = createAuthClient({
  plugins: [
    oauthProviderResourceClient(
      auth as unknown as Parameters<typeof oauthProviderResourceClient>[0]
    ),
  ],
});
