import type { MetadataRoute } from "next";

import { getSiteUrl } from "~/lib/site-url";

/** Same host handling as the sitemap: the advertised sitemap URL must sit on the host that served robots.txt. */
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();

  return {
    rules: {
      allow: "/",
      disallow: [
        "/api/",
        "/*/dashboard",
        "/*/admin",
        "/*/device",
        "/*/oauth/",
        "/*/two-factor",
        "/*/reset-password",
        "/*/accept-invitation/",
        "/*/client-test",
      ],
      userAgent: "*",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
