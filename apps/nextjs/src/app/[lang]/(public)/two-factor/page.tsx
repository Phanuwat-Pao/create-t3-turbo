import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { TwoFactorTotpClient } from "./_components/two-factor-totp-client";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <TwoFactorTotpClient />;
}
