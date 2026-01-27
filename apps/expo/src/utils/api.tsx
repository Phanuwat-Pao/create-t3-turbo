import type { AppRouter } from "@acme/api";
import type { RouterClient } from "@orpc/server";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryClient } from "@tanstack/react-query";

import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ...
    },
  },
});

const link = new RPCLink({
  headers: () => {
    const headers: Record<string, string> = {
      "x-trpc-source": "expo-react",
    };
    const cookies = authClient.getCookie();
    if (cookies) {
      headers.Cookie = cookies;
    }
    return headers;
  },
  url: `${getBaseUrl()}/api/rpc`,
});

const client: RouterClient<AppRouter> = createORPCClient(link);

/**
 * A set of typesafe hooks for consuming your API.
 */
export const orpc = createTanstackQueryUtils(client);

export type { RouterInputs, RouterOutputs } from "@acme/api";
