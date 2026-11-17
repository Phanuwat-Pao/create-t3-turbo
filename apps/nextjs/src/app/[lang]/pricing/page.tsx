import type { Metadata } from "next";

import { Pricing } from "~/components/pricing";
import type { Locale } from "~/i18n/i18n-config";
import { getT } from "~/i18n/server";
import { pageMetadata } from "~/lib/metadata";
import { getSiteUrl } from "~/lib/site-url";

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const { t } = await getT();
  return pageMetadata({
    description: t("seo.pricing.description"),
    locale: lang,
    path: "/pricing",
    siteName: t("seo.siteName"),
    siteUrl: await getSiteUrl(),
    title: t("seo.pricing.title"),
  });
}

export default async function Page() {
  const { t } = await getT();
  const demoPlans = [
    {
      buttonText: t("pricing.plus.buttonText"),
      description: t("pricing.plus.description"),
      features: [
        t("pricing.plus.features.projects"),
        t("pricing.plus.features.analytics"),
        t("pricing.plus.features.support"),
        t("pricing.plus.features.api"),
      ],
      href: "/sign-up",
      isPopular: false,
      name: "Plus",
      period: t("pricing.perMonth"),
      price: "20",
      yearlyPrice: "16",
    },
    {
      buttonText: t("pricing.pro.buttonText"),
      description: t("pricing.pro.description"),
      features: [
        t("pricing.pro.features.projects"),
        t("pricing.pro.features.analytics"),
        t("pricing.pro.features.support"),
        t("pricing.pro.features.api"),
        t("pricing.pro.features.priority"),
      ],
      href: "/sign-up",
      isPopular: true,
      name: "Pro",
      period: t("pricing.perMonth"),
      price: "50",
      yearlyPrice: "40",
    },
  ];

  return <Pricing plans={demoPlans} />;
}
