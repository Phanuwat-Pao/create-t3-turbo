"use client";

import type { AppRouter } from "@acme/api";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

import { env } from "~/env";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const link = new RPCLink({
  headers: () => ({
    "x-trpc-source": "nextjs-react",
  }),
  url: `${getBaseUrl()}/api/rpc`,
});

export const orpcClient: RouterClient<AppRouter> = createORPCClient(link);
