import { defineConfig } from "next-i18next";

export const i18n = {
  defaultLocale: "th",
  locales: ["th", "en"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

/**
 * next-i18next config shared by the proxy (locale redirect and language
 * cookie) and the server `getT` in `./server`. Resources are attached there,
 * so the proxy bundle does not carry the translation JSON. One `translation`
 * namespace per locale, the same layout the Expo app uses.
 */
export const i18nConfig = defineConfig({
  defaultNS: "translation",
  fallbackLng: i18n.defaultLocale,
  localeParamName: "lang",
  supportedLngs: [...i18n.locales],
});
