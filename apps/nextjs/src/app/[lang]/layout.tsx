import type { Metadata, Viewport } from "next";

import { cn } from "@acme/ui";
import { Geist, Geist_Mono } from "next/font/google";

import { BackgroundRippleEffect } from "~/components/background-ripple-effect";
import Header from "~/components/header";
import Providers from "~/components/providers";
import { createMetadata } from "~/lib/metadata";
import "~/app/styles.css";

export const metadata: Metadata = createMetadata({
  description: "The most comprehensive authentication framework for TypeScript",
  metadataBase: new URL("https://demo.better-auth.com"),
  title: {
    default: "Better Auth",
    template: "%s | Better Auth",
  },
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
      </head>
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
