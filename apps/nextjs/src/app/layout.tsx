import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Toaster } from "@acme/ui/sonner";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";

import { ConvexClientProvider } from "~/convex/react";
import { createMetadata } from "~/lib/metadata";

import "~/app/styles.css";

export const metadata = createMetadata({
  title: {
    template: "%s | Better Auth",
    default: "Better Auth",
  },
  description: "The most comprehensive authentication framework for TypeScript",
  metadataBase: new URL("https://demo.better-auth.com"),
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
      </head> */}
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <div className="absolute right-4 bottom-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
