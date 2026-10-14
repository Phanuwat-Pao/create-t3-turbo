import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

import { ResetPasswordClient } from "./_components/reset-password-client";

export const metadata: Metadata = { robots: NOINDEX };

export default function Page() {
  return <ResetPasswordClient />;
}
