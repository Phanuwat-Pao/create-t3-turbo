import { useParams } from "next/navigation";

import type { Locale } from "./i18n-config";
import { toLocale } from "./localized-path";

/** The current page's locale, read from the `[lang]` route param. */
export function useLocale(): Locale {
  return toLocale(useParams<{ lang?: string }>().lang);
}
