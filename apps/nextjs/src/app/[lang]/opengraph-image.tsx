import { ImageResponse } from "next/og";

import { getT } from "~/i18n/server";

export const alt = "create-t3-turbo";
export const contentType = "image/png";
export const size = { height: 630, width: 1200 };

interface ImageProps {
  params: Promise<{ lang: string }>;
}

/**
 * Generated per locale so the share card carries the visitor's language.
 * Rendered at request time with the app's own fonts unavailable in the OG
 * runtime, so it sticks to system sans.
 */
export default async function OpenGraphImage({ params }: ImageProps) {
  const { lang } = await params;
  // Metadata image routes cannot read root params, so pass the language.
  const { t } = await getT("translation", { lng: lang });

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#09090b",
        color: "#fafafa",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "center",
        padding: 80,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", fontSize: 88, fontWeight: 800 }}>
        {t("seo.siteName")}
      </div>
      <div
        style={{
          color: "#a1a1aa",
          display: "flex",
          fontSize: 34,
          marginTop: 24,
          maxWidth: 960,
          textAlign: "center",
        }}
      >
        {t("seo.description")}
      </div>
    </div>,
    size
  );
}
