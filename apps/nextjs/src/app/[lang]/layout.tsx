import { cn } from "@acme/ui";
import type { Metadata, Viewport } from "next";
import { I18nProvider } from "next-i18next/client";
import { Geist, Geist_Mono } from "next/font/google";

import { BackgroundRippleEffect } from "~/components/background-ripple-effect";
import Header from "~/components/header";
import Providers from "~/components/providers";
import { i18n } from "~/i18n/i18n-config";
import { getResources, getT } from "~/i18n/server";
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

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/**
 * `getT()` reads the `[lang]` root param and falls back to the default locale
 * for anything unsupported. Client Components get only the current language's
 * resources; th and en carry the same keys, so nothing needs a fallback.
 */
export default async function RootLayout({ children }: LayoutProps) {
  const { i18n: i18nInstance, lng } = await getT();
  return (
    <html lang={lng} suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <I18nProvider
          defaultNS="translation"
          language={lng}
          resources={getResources(i18nInstance, ["translation"], [lng])}
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
        </I18nProvider>
      </body>
    </html>
  );
}
