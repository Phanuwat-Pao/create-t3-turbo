import type { MetadataRoute } from "next";

import { i18n } from "~/i18n/i18n-config";
import {
  languageAlternates,
  localizedPath,
  PUBLIC_PATHS,
} from "~/lib/metadata";
import { getSiteUrl } from "~/lib/site-url";

/**
 * Reads the request host, so `www.example.com/sitemap.xml` lists
 * `www.example.com/...` URLs and the bare domain lists bare ones. Search
 * engines treat the two hosts as separate sites, and a sitemap must only
 * contain URLs on the host it was fetched from.
 */
export const dynamic = "force-dynamic";

const PRIORITY: Record<(typeof PUBLIC_PATHS)[number], number> = {
  "/": 1,
  "/forget-password": 0.3,
  "/pricing": 0.8,
  "/sign-in": 0.5,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_PATHS.flatMap((path) =>
    i18n.locales.map((locale) => ({
      alternates: { languages: languageAlternates(siteUrl, path) },
      changeFrequency: "weekly" as const,
      lastModified,
      priority: PRIORITY[path],
      url: new URL(localizedPath(locale, path), siteUrl).href,
    }))
  );
}
