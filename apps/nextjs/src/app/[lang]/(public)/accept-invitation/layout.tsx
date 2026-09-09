import type { Metadata } from "next";

import { NOINDEX } from "~/lib/metadata";

/** Client-rendered flow; the page cannot export metadata, so the layout keeps it out of the index. */
export const metadata: Metadata = { robots: NOINDEX };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
