"use client";

import { useQuery } from "@tanstack/react-query";

import { authClient } from "~/auth/client";

export const deviceKeys = {
  all: () => ["device"] as const,
  request: (userCode: string) =>
    [...deviceKeys.all(), "request", userCode] as const,
};

export type DeviceRequest =
  | { kind: "pending"; clientId: string; scope: string | undefined }
  | { kind: "rejected" };

/**
 * Loads what a device asked for before the user approves it. Server errors,
 * rate limits and network failures throw, so the page can offer a retry. A
 * code that is invalid, expired, already used or claimed by another session
 * comes back as `rejected`, because retrying cannot fix it.
 */
export async function getDeviceRequest(
  userCode: string
): Promise<DeviceRequest> {
  const { data, error } = await authClient.device({
    query: { user_code: userCode },
  });
  if (error && (!error.status || error.status === 429 || error.status >= 500)) {
    throw new Error(error.error_description || error.statusText);
  }
  if (!data?.client_id || data.status !== "pending") {
    return { kind: "rejected" };
  }
  return { clientId: data.client_id, kind: "pending", scope: data.scope };
}

export const useDeviceRequestQuery = (userCode: string, enabled: boolean) =>
  useQuery({
    enabled: enabled && userCode.length > 0,
    queryFn: () => getDeviceRequest(userCode),
    // The key carries the code, so details loaded for one code never label
    // or enable another.
    queryKey: deviceKeys.request(userCode),
    refetchOnWindowFocus: false,
    retry: false,
  });
