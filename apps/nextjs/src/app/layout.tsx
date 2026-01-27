import type { Metadata, Viewport } from "next";

import { cn } from "@acme/ui";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";
import { Geist, Geist_Mono } from "next/font/google";

import { env } from "~/env";
import { ORPCReactProvider } from "~/rpc/react";
import "~/app/styles.css";

export const metadata: Metadata = {
  description: "Simple monorepo with shared backend for web & mobile apps",
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000"
  ),
  openGraph: {
    description: "Simple monorepo with shared backend for web & mobile apps",
    siteName: "Create T3 Turbo",
    title: "Create T3 Turbo",
    url: "https://create-t3-turbo.vercel.app",
  },
  title: "Create T3 Turbo",
  twitter: {
    card: "summary_large_image",
    creator: "@jullerino",
    site: "@jullerino",
  },
};

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

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider>
          <ORPCReactProvider>{props.children}</ORPCReactProvider>
          <div className="absolute right-4 bottom-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
