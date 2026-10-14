import type { Metadata } from "next";

import type { Locale } from "~/i18n/i18n-config";
import { getT } from "~/i18n/server";
import { pageMetadata } from "~/lib/metadata";
import { getSiteUrl } from "~/lib/site-url";

import ForgetPasswordPage from "./_components/forget-password-page";

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const { t } = await getT();
  return pageMetadata({
    description: t("seo.forgotPassword.description"),
    locale: lang,
    path: "/forget-password",
    siteName: t("seo.siteName"),
    siteUrl: await getSiteUrl(),
    title: t("seo.forgotPassword.title"),
  });
}

export default function Page() {
  return <ForgetPasswordPage />;
}
