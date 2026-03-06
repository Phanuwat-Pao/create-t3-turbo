import type { AppRouter } from "@acme/api";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import {
  dehydrate,
  type FetchQueryOptions,
  HydrationBoundary,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { cache } from "react";

import { env } from "~/env";

import { createQueryClient } from "./query-client";

const getQueryClient = cache(createQueryClient);

// For RSC, create a server-side client
const getBaseUrl = () => {
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }
  return `http://localhost:3000`;
};

const link = new RPCLink({
  headers: async () => {
    const heads = await headers();
    return {
      cookie: heads.get("cookie") ?? "",
      "x-trpc-source": "rsc",
    };
  },
  url: `${getBaseUrl()}/api/rpc`,
});

const client: RouterClient<AppRouter> = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export async function prefetch(queryOptions: FetchQueryOptions) {
  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery(queryOptions);
  } catch {
    // Silently ignore prefetch errors - they'll be handled when the query actually runs
  }
}
