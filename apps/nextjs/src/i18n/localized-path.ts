import { i18n, type Locale } from "./i18n-config";

const isLocale = (value: string | undefined): value is Locale =>
  (i18n.locales as readonly string[]).includes(value ?? "");

/** A `[lang]` route param as a supported locale, falling back to the default. */
export const toLocale = (value: string | undefined): Locale =>
  isLocale(value) ? value : i18n.defaultLocale;

/** Locale-prefixed path, collapsing "/" so the root is "/en" rather than "/en/". */
export function localizedPath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Puts `locale` in front of an in-app path such as "/dashboard?x=1".
 * Everything else passes through unchanged: paths that already carry a
 * locale, API and `_next` routes, static files (a dot in the last segment,
 * the same rule the proxy's matcher uses), and hrefs that are not
 * root-relative.
 */
export function withLocale(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  const end = href.search(/[?#]/u);
  const path = end === -1 ? href : href.slice(0, end);
  const rest = end === -1 ? "" : href.slice(end);
  const segments = path.split("/");
  const first = segments[1] ?? "";
  if (
    isLocale(first) ||
    first === "api" ||
    first === "_next" ||
    segments.at(-1)?.includes(".")
  ) {
    return href;
  }
  return localizedPath(locale, path) + rest;
}
