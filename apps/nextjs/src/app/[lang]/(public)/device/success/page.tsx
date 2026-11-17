import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { requireDeviceSession } from "../_lib/require-session";
import { DeviceSuccessClient } from "./_components/device-success-client";

export const metadata: Metadata = { robots: NOINDEX };

export default async function Page() {
  await requireDeviceSession();
  return <DeviceSuccessClient />;
}
