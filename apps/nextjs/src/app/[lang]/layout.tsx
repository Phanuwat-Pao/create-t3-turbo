import { cn } from "@acme/ui";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BackgroundRippleEffect } from "~/components/background-ripple-effect";
import Header from "~/components/header";
import Providers from "~/components/providers";
import { getDictionary } from "~/i18n/get-dictionary";
import { i18n, type Locale } from "~/i18n/i18n-config";
import { getSiteUrl } from "~/lib/site-url";

import "~/app/styles.css";

interface LayoutProps {
  children: React.ReactNode;
  /** Next types the segment as `string`; the proxy guarantees a supported locale. */
  params: Promise<{ lang: string }>;
}

function toLocale(lang: string): Locale {
  return (i18n.locales as readonly string[]).includes(lang)
    ? (lang as Locale)
    : i18n.defaultLocale;
}

/**
 * Site-wide defaults every page inherits. `metadataBase` is the origin of
 * the current request, so relative Open Graph and icon URLs resolve on the
 * same host (www or bare) the visitor is using.
 */
export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { lang: requestedLang } = await params;
  const lang = toLocale(requestedLang);
  const dict = await getDictionary(lang);

  return {
    applicationName: dict.seo.siteName,
    description: dict.seo.description,
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
      siteName: dict.seo.siteName,
      type: "website",
    },
    title: {
      default: dict.seo.defaultTitle,
      template: dict.seo.titleTemplate,
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

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang: requestedLang } = await params;
  const lang = toLocale(requestedLang);
  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
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
      </body>
    </html>
  );
}
