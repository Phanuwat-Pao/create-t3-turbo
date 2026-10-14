import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { DeviceApproveClient } from "./_components/device-approve-client";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <DeviceApproveClient />;
}
