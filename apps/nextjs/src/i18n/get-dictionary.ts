import "server-only";
import { i18n, type Locale } from "./i18n-config";

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: async () => {
    const dict = await import("./en.json");
    return dict.default;
  },
  th: async () => {
    const dict = await import("./th.json");
    return dict.default;
  },
};

// export const getDictionary = async (locale: Locale) => dictionaries[locale]();
export const getDictionary = async (locale: Locale) => {
  // Validate locale and fallback to default if invalid
  const validLocale = (i18n.locales as readonly string[]).includes(locale)
    ? locale
    : i18n.defaultLocale;

  const dictionaryLoader = dictionaries[validLocale as Locale];

  if (!dictionaryLoader) {
    throw new Error(`Dictionary not found for locale: ${locale}`);
  }

  return dictionaryLoader();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
