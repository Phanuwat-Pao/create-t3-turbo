import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { DeviceAuthClient } from "./_components/device-auth-client";
import { requireDeviceSession } from "./_lib/require-session";

export const metadata: Metadata = { robots: NOINDEX };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ user_code?: string | string[] }>;
}) {
  const { user_code } = await searchParams;
  await requireDeviceSession(user_code);
  return <DeviceAuthClient />;
}
