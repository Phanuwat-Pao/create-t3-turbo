import "server-only";
import { createServerI18next } from "next-i18next/server";
import { redirect } from "next/navigation";

import en from "./en.json";
import { i18nConfig } from "./i18n-config";
import { toLocale, withLocale } from "./localized-path";
import th from "./th.json";

/**
 * `getT()` resolves the language from the `[lang]` root param, so Server
 * Components and `generateMetadata` call it without arguments. Route
 * handlers (OG image, manifest) have no root params and must pass `lng`.
 */
export const { getT, getResources } = createServerI18next({
  ...i18nConfig,
  resources: {
    en: { translation: en },
    th: { translation: th },
  },
});

/**
 * `redirect()` to an in-app path in the current request's locale, so the
 * browser does not take a second hop through the proxy's locale redirect.
 */
export async function localizedRedirect(path: string): Promise<never> {
  const { lng } = await getT();
  redirect(withLocale(path, toLocale(lng)));
}
