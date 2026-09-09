import type { Metadata } from "next";

import type { Dictionary } from "~/i18n/get-dictionary";
import { i18n, type Locale } from "~/i18n/i18n-config";

const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  th: "th_TH",
};

/** Public routes that get a canonical, hreflang alternates and a sitemap entry. */
export const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/sign-in",
  "/forget-password",
] as const;
export type PublicPath = (typeof PUBLIC_PATHS)[number];

/** Locale-prefixed path, collapsing "/" so the root is "/en" rather than "/en/". */
export function localizedPath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * hreflang map for one path: every locale plus `x-default`, which points at
 * the default locale so search engines send unmatched visitors there. The
 * middleware redirects the bare path to a locale, so it is never the
 * canonical itself.
 */
export function languageAlternates(
  siteUrl: URL,
  path: string
): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of i18n.locales) {
    alternates[locale] = new URL(localizedPath(locale, path), siteUrl).href;
  }
  alternates["x-default"] = new URL(
    localizedPath(i18n.defaultLocale, path),
    siteUrl
  ).href;
  return alternates;
}

interface PageMetadataInput {
  dict: Dictionary;
  locale: Locale;
  path: PublicPath;
  siteUrl: URL;
  title: string;
  description: string;
}

/**
 * Metadata for an indexable public page. `metadataBase` comes from the
 * request, so canonicals and Open Graph URLs match whichever host (www or
 * bare) the visitor is on.
 */
export function pageMetadata({
  dict,
  locale,
  path,
  siteUrl,
  title,
  description,
}: PageMetadataInput): Metadata {
  const canonical = new URL(localizedPath(locale, path), siteUrl).href;
  return {
    alternates: {
      canonical,
      languages: languageAlternates(siteUrl, path),
    },
    description,
    metadataBase: siteUrl,
    openGraph: {
      description,
      locale: OG_LOCALES[locale],
      siteName: dict.seo.siteName,
      title,
      type: "website",
      url: canonical,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      title,
    },
  };
}

/** Metadata for account and auth flows that must never be indexed. */
export const NOINDEX: Metadata["robots"] = {
  follow: false,
  index: false,
};
