"use client";

import { useQuery } from "@tanstack/react-query";

import { authClient } from "~/auth/client";

import { userKeys } from "./keys";

export async function getSession() {
  const { data, error } = await authClient.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export type SessionData = Awaited<ReturnType<typeof getSession>>;

export const useSessionQuery = (initialData?: SessionData) =>
  useQuery<SessionData>({
    initialData,
    queryFn: async () => await getSession(),
    queryKey: userKeys.session(),
    retry: 1,
  });
