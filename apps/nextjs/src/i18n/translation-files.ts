import "server-only";
import { createHash } from "node:crypto";

import { preload } from "react-dom";

import en from "./en.json";
import { i18n, type Locale } from "./i18n-config";
import th from "./th.json";

const RESOURCES: Record<Locale, unknown> = { en, th };
const files = new Map<Locale, { body: string; hash: string }>();

/** A language's translations as the file serves them, with a hash of the words; computed once per process. */
export function translationFile(lng: Locale) {
  let file = files.get(lng);
  if (!file) {
    const body = JSON.stringify(RESOURCES[lng]);
    file = {
      body,
      hash: createHash("sha256").update(body).digest("hex").slice(0, 12),
    };
    files.set(lng, file);
  }
  return file;
}

/**
 * Where the browser reads each language's translations (app/i18n/[file]/route.ts). The address carries a hash of
 * the words, so the browser keeps the file for a year and still gets new words after a deploy changes them. The dot
 * in the file name keeps the proxy away from it.
 */
export function translationHrefs(): Record<Locale, string> {
  return Object.fromEntries(
    i18n.locales.map((lng) => [
      lng,
      `/i18n/${lng}.translation.${translationFile(lng).hash}.json`,
    ])
  ) as Record<Locale, string>;
}

/**
 * The addresses, with a hint in the page's <head> for the current language, so the browser fetches the file
 * alongside the page's script instead of after it.
 */
export function preloadTranslations(lng: Locale): Record<Locale, string> {
  const hrefs = translationHrefs();
  preload(hrefs[lng], { as: "fetch", crossOrigin: "anonymous" });
  return hrefs;
}
