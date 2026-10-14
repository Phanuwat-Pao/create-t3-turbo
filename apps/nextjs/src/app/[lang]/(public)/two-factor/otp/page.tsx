import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { TwoFactorOtpClient } from "./_components/two-factor-otp-client";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <TwoFactorOtpClient />;
}
