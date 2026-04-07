"use client";

import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { orpcClient } from "./client";
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

// Export the oRPC utils for use in components
export const orpc = createTanstackQueryUtils(orpcClient);

// Provider only needs QueryClientProvider (no TRPCProvider needed in oRPC)
export function ORPCReactProvider(props: { children: React.ReactNode }) {
  // eslint-disable-next-line react/hook-use-state -- intentionally read-only; singleton query client
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
