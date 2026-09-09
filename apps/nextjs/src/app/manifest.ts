import type { MetadataRoute } from "next";

import { getDictionary } from "~/i18n/get-dictionary";
import { i18n } from "~/i18n/i18n-config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const dict = await getDictionary(i18n.defaultLocale);

  return {
    background_color: "#09090b",
    description: dict.seo.description,
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/favicon/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/favicon/android-chrome-512x512.png",
        type: "image/png",
      },
    ],
    name: dict.seo.siteName,
    short_name: dict.seo.siteName,
    start_url: `/${i18n.defaultLocale}`,
    theme_color: "#09090b",
  };
}
