import { cache } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { createQueryClient } from "./query-client";

const getQueryClient = cache(createQueryClient);

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
