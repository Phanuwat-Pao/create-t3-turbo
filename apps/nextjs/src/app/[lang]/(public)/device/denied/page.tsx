import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { DeviceDeniedClient } from "./_components/device-denied-client";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <DeviceDeniedClient />;
}
