import { cache } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import type { AppRouter } from "@acme/api";

import { env } from "~/env";
import { createQueryClient } from "./query-client";

const getQueryClient = cache(createQueryClient);

// For RSC, create a server-side client
const getBaseUrl = () => {
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return `http://localhost:3000`;
};

const link = new RPCLink({
  url: getBaseUrl() + "/api/rpc",
  headers: async () => {
    const heads = await headers();
    return {
      cookie: heads.get("cookie") ?? "",
      "x-trpc-source": "rsc",
    };
  },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends { queryKey: any; queryFn: any }>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(queryOptions);
}
