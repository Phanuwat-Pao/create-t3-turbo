import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { DeviceSuccessClient } from "./_components/device-success-client";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <DeviceSuccessClient />;
}
