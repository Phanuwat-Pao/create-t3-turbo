import { createInstance, type TFunction } from "i18next";

import en from "~/i18n/en.json";
import type { Locale } from "~/i18n/i18n-config";
import th from "~/i18n/th.json";

/**
 * Emails go out from auth callbacks, outside any page request, so they get
 * their own i18next instance instead of the route-bound `getT()`. The
 * templates pass it to `TransWithoutContext` for copy with markup.
 */
export const emailI18n = createInstance();

// The resources are bundled, so init completes synchronously.
void emailI18n.init({
  defaultNS: "translation",
  fallbackLng: "en",
  initAsync: false,
  // React escapes rendered text, and subjects are plain text.
  interpolation: { escapeValue: false },
  resources: {
    en: { translation: en },
    th: { translation: th },
  },
  supportedLngs: ["en", "th"],
});

export type EmailT = TFunction<"translation">;

/** A `t` bound to one language, whatever language the server runs in. */
export function getEmailT(locale: Locale): EmailT {
  return emailI18n.getFixedT(locale);
}
