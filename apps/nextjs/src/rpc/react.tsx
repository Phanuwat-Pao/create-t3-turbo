"use client";

import type { AppRouter } from "@acme/api";
import type { RouterClient } from "@orpc/server";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { env } from "~/env";

import { createQueryClient } from "./query-client";

let clientQueryClientSingleton;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const link = new RPCLink({
  headers: () => ({
    "x-trpc-source": "nextjs-react",
  }),
  url: `${getBaseUrl()}/api/rpc`,
});

const client: RouterClient<AppRouter> = createORPCClient(link);

// Export the oRPC utils for use in components
export const orpc = createTanstackQueryUtils(client);

// Provider only needs QueryClientProvider (no TRPCProvider needed in oRPC)
export function ORPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
