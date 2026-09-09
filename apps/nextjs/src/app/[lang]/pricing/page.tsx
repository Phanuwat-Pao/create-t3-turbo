import type { Metadata } from "next";

import { Pricing } from "~/components/pricing";
import { getDictionary } from "~/i18n/get-dictionary";
import type { Locale } from "~/i18n/i18n-config";
import { pageMetadata } from "~/lib/metadata";
import { getSiteUrl } from "~/lib/site-url";

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return pageMetadata({
    description: dict.seo.pricing.description,
    dict,
    locale: lang,
    path: "/pricing",
    siteUrl: await getSiteUrl(),
    title: dict.seo.pricing.title,
  });
}

const demoPlans = [
  {
    buttonText: "Start Free Trial",
    description: "Perfect for individuals and small projects",
    features: [
      "Up to 10 projects",
      "Basic analytics",
      "48-hour support response time",
      "Limited API access",
    ],
    href: "/sign-up",
    isPopular: false,
    name: "Plus",
    period: "per month",
    price: "20",
    yearlyPrice: "16",
  },
  {
    buttonText: "Get Started",
    description: "Ideal for growing teams and businesses",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "24-hour support response time",
      "Full API access",
      "Priority support",
    ],
    href: "/sign-up",
    isPopular: true,
    name: "Pro",
    period: "per month",
    price: "50",
    yearlyPrice: "40",
  },
];

export default function Page() {
  return <Pricing plans={demoPlans} />;
}
