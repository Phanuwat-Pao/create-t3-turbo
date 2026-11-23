import { cn } from "@acme/ui";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BackgroundRippleEffect } from "~/components/background-ripple-effect";
import Header from "~/components/header";
import Providers from "~/components/providers";
import { i18n } from "~/i18n/i18n-config";
import { toLocale } from "~/i18n/localized-path";
import { getT } from "~/i18n/server";
import { preloadTranslations } from "~/i18n/translation-files";
import { TranslationsProvider } from "~/i18n/translations-provider";
import { getSiteUrl } from "~/lib/site-url";

import "~/app/styles.css";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Site-wide defaults every page inherits. `metadataBase` is the origin of
 * the current request, so relative Open Graph and icon URLs resolve on the
 * same host (www or bare) the visitor is using.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  return {
    applicationName: t("seo.siteName"),
    description: t("seo.description"),
    icons: {
      apple: "/favicon/apple-touch-icon.png",
      icon: [
        { sizes: "any", url: "/favicon/favicon.ico" },
        {
          sizes: "32x32",
          type: "image/png",
          url: "/favicon/favicon-32x32.png",
        },
        {
          sizes: "16x16",
          type: "image/png",
          url: "/favicon/favicon-16x16.png",
        },
      ],
    },
    metadataBase: await getSiteUrl(),
    openGraph: {
      siteName: t("seo.siteName"),
      type: "website",
    },
    title: {
      default: t("seo.defaultTitle"),
      template: t("seo.titleTemplate"),
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: [
    { color: "white", media: "(prefers-color-scheme: light)" },
    { color: "black", media: "(prefers-color-scheme: dark)" },
  ],
};

/*
 * Not preloaded. A preload goes out in the page's Link header, so the browser asks for the fonts before the
 * stylesheet, and on a fresh connection far from the server the first round trips carry only 15 to 60 KB: the font
 * files push the stylesheet, and the first paint with it, back by a round trip. Without them the page paints in the
 * fallback (sized to match by next/font) and the fonts swap in when the stylesheet asks for them.
 */
const geistSans = Geist({
  preload: false,
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  preload: false,
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/**
 * `getT()` reads the `[lang]` root param and falls back to the default locale
 * for anything unsupported. Client Components get only the current language,
 * read from its own cached file (see ~/i18n/translations-provider); th and en
 * carry the same keys, so nothing needs a fallback.
 */
export default async function RootLayout({ children }: LayoutProps) {
  const { lng } = await getT();
  const locale = toLocale(lng);
  return (
    <html lang={lng} suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <TranslationsProvider
          hrefs={preloadTranslations(locale)}
          language={locale}
        >
          <Providers>
            <div className="relative mt-14 min-h-[calc(100vh-3.5rem)] w-full">
              {/* Site Header */}
              <Header />

              {/* Background Ripple Effect */}
              <div className="absolute inset-0 z-0">
                <BackgroundRippleEffect />
              </div>

              {/* Content */}
              <div className="relative z-10 mx-auto w-full max-w-4xl p-6">
                {children}
              </div>
            </div>
          </Providers>
        </TranslationsProvider>
      </body>
    </html>
  );
}
