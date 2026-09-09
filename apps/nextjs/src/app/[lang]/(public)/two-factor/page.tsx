import type { Metadata } from "next";

import { getDictionary } from "~/i18n/get-dictionary";
import type { Locale } from "~/i18n/i18n-config";
import { NOINDEX } from "~/lib/metadata";

import { TwoFactorTotpClient } from "./_components/two-factor-totp-client";

export const metadata: Metadata = { robots: NOINDEX };

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <TwoFactorTotpClient dict={dict} />;
}
