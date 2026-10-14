import type en from "./en.json";

// Types every `t()` key against the English resources.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}
