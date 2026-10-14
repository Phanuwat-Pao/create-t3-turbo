import type { MetadataRoute } from "next";

import { i18n } from "~/i18n/i18n-config";
import { getT } from "~/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { t } = await getT("translation", { lng: i18n.defaultLocale });

  return {
    background_color: "#09090b",
    description: t("seo.description"),
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
    name: t("seo.siteName"),
    short_name: t("seo.siteName"),
    start_url: `/${i18n.defaultLocale}`,
    theme_color: "#09090b",
  };
}
