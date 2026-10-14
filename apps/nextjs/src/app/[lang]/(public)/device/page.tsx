import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { DeviceAuthClient } from "./_components/device-auth-client";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <DeviceAuthClient />;
}
