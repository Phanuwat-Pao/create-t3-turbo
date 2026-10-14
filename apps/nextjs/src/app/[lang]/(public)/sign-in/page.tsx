import type { Metadata } from "next";

import type { Locale } from "~/i18n/i18n-config";
import { getT } from "~/i18n/server";
import { pageMetadata } from "~/lib/metadata";
import { getSiteUrl } from "~/lib/site-url";

import SignInPage from "./_components/sign-in-page";

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const { t } = await getT();
  return pageMetadata({
    description: t("seo.signIn.description"),
    locale: lang,
    path: "/sign-in",
    siteName: t("seo.siteName"),
    siteUrl: await getSiteUrl(),
    title: t("seo.signIn.title"),
  });
}

export default function Page() {
  return <SignInPage />;
}
