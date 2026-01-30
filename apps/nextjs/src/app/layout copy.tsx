import "./globals.css";
import type { Metadata } from "next";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { BackgroundRippleEffect } from "@/components/background-ripple-effect";
import Header from "@/components/header";
import Providers from "@/components/providers";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  description: "The most comprehensive authentication framework for TypeScript",
  metadataBase: new URL("https://demo.better-auth.com"),
  title: {
    template: "%s | Better Auth",
    default: "Better Auth",
  },
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
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
