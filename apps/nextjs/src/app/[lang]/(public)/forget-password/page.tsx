import type { Metadata } from "next";

import { getDictionary } from "~/i18n/get-dictionary";
import type { Locale } from "~/i18n/i18n-config";
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
  const dict = await getDictionary(lang);
  return pageMetadata({
    description: dict.seo.forgotPassword.description,
    dict,
    locale: lang,
    path: "/forget-password",
    siteUrl: await getSiteUrl(),
    title: dict.seo.forgotPassword.title,
  });
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <ForgetPasswordPage dict={dict} />;
}
