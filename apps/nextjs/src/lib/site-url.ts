import { headers } from "next/headers";

import { siteUrlFromHeaders } from "~/lib/site-url-from-headers";

/**
 * Origin of the request currently being served. Metadata, the sitemap and
 * robots.txt all build URLs from this, so whichever host (www or bare) the
 * visitor used is the host every emitted URL points back at.
 */
export async function getSiteUrl(): Promise<URL> {
  return siteUrlFromHeaders(await headers());
}
