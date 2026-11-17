import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { requireDeviceSession } from "../_lib/require-session";
import { DeviceApproveClient } from "./_components/device-approve-client";

export const metadata: Metadata = { robots: NOINDEX };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ user_code?: string | string[] }>;
}) {
  const { user_code } = await searchParams;
  await requireDeviceSession(user_code);
  return <DeviceApproveClient />;
}
