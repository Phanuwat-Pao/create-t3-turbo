import type { ResourceKey } from "i18next";

/*
 * Translations for the server render of Client Components, handed over through globalThis. Next renders Server and
 * Client Components in the same process but gives each its own copy of every module, so `~/i18n/server` (which
 * imports the JSON files) puts them here and the client provider reads them back during server rendering, at once.
 * This module imports no JSON itself, so the browser build stays free of the files.
 */
const KEY = Symbol.for("acme.i18n.ssr-translations");

interface WithTranslations {
  [KEY]?: Partial<Record<string, ResourceKey>>;
}

/** Called once by `~/i18n/server` with every language's resources. */
export function setSsrTranslations(
  resources: Partial<Record<string, ResourceKey>>
) {
  (globalThis as WithTranslations)[KEY] = resources;
}

/** A language's resources while rendering on the server; undefined in the browser. */
export function ssrTranslations(lng: string): ResourceKey | undefined {
  if (typeof window !== "undefined") {
    return undefined;
  }
  return (globalThis as WithTranslations)[KEY]?.[lng];
}
