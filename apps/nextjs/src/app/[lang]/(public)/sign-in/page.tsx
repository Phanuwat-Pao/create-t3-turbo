import type { Metadata } from "next";

import { getDictionary } from "~/i18n/get-dictionary";
import type { Locale } from "~/i18n/i18n-config";
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
  const dict = await getDictionary(lang);
  return pageMetadata({
    description: dict.seo.signIn.description,
    dict,
    locale: lang,
    path: "/sign-in",
    siteUrl: await getSiteUrl(),
    title: dict.seo.signIn.title,
  });
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <SignInPage dict={dict} />;
}
