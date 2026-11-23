"use client";

import type { ResourceKey } from "i18next";
import { I18nProvider } from "next-i18next/client";
import { use } from "react";

import type { Locale } from "./i18n-config";
import { ssrTranslations } from "./ssr-translations";

const loads = new Map<string, Promise<ResourceKey>>();

const pause = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function fetchTranslations(href: string): Promise<ResourceKey> {
  const response = await fetch(href);
  if (!response.ok) {
    throw new Error(`${href} answered ${response.status}`);
  }
  return (await response.json()) as ResourceKey;
}

/**
 * The file the page preloaded, fetched once per address: the same promise every time, so when hydration retries
 * after it resolves, `use()` gets the result at once. A weak signal gets a second try after a second.
 */
function fetchOnce(href: string): Promise<ResourceKey> {
  let load = loads.get(href);
  if (!load) {
    load = fetchTranslations(href).catch(async () => {
      await pause(1000);
      return fetchTranslations(href);
    });
    // A failed load is forgotten, so the next attempt asks again.
    load.catch(() => loads.delete(href));
    loads.set(href, load);
  }
  return load;
}

/**
 * next-i18next's I18nProvider, given the translations from their own file instead of from the page.
 *
 * The usual way passes `resources` from the root layout, and they ride inside the page's RSC payload, which every
 * hard load and every `router.refresh()` downloads again. Here the root layout passes only the file's address, which
 * carries a hash of the words, so the browser keeps the file for a year; the layout also preloads it from <head>.
 *
 * In the browser, `use()` holds hydration until the file is in, and the server's HTML stays on screen meanwhile, so
 * keys never flash. On the server the resources are already in memory (./ssr-translations) and the page renders at
 * once. There is no <Suspense> here on purpose: a boundary would let React send the page before the server
 * components' data, as a late boundary whose reveal React delays, and the first paint moved by about 0.3 s.
 */
export function TranslationsProvider({
  children,
  hrefs,
  language,
}: {
  children: React.ReactNode;
  hrefs: Record<Locale, string>;
  language: Locale;
}) {
  const translation =
    ssrTranslations(language) ?? use(fetchOnce(hrefs[language]));
  return (
    <I18nProvider
      defaultNS="translation"
      language={language}
      resources={{ [language]: { translation } }}
    >
      {children}
    </I18nProvider>
  );
}
