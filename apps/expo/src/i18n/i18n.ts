import { getLocales } from "expo-localization";
import { Storage } from "expo-sqlite/kv-store";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "~/i18n/en.json";
import th from "~/i18n/th.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: "translation";
    // custom resources type
    resources: {
      translation: typeof en;
    };
    // other
  }
}

const resources = {
  en: { translation: en },
  th: { translation: th },
};

const LANGUAGE_KEY = "@app_language";

async function initI18n() {
  const savedLanguage = await Storage.getItem(LANGUAGE_KEY);

  // Determine which language to use
  let selectedLanguage = savedLanguage;

  if (!selectedLanguage) {
    // If no saved language, use device locale or fallback
    const deviceLocales = getLocales();
    const deviceLocale = deviceLocales[0]?.languageTag ?? "en";
    const languageCode = deviceLocale.split("-")[0] ?? "en";
    // Try exact locale match first
    if (deviceLocale in resources) {
      selectedLanguage = deviceLocale;
    }
    // Then try language code match
    else if (languageCode in resources) {
      selectedLanguage = languageCode;
    } else {
      selectedLanguage = "en";
    }
  }

  // oxlint-disable-next-line no-named-as-default-member -- i18n.use() is the standard i18next API for plugin registration
  await i18n.use(initReactI18next).init({
    defaultNS: "translation",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    lng: selectedLanguage,
    resources,
  });
}

(async () => {
  try {
    await initI18n();
  } catch {
    // Initialization error handled silently - fallback to default language
  }
})();

export { i18n as default };
