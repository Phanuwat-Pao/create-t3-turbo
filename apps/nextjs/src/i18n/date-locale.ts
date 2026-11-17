import type { DayPickerLocale } from "react-day-picker";
import { enUS } from "react-day-picker/locale/en-US";
import { th } from "react-day-picker/locale/th";

import type { Locale } from "./i18n-config";

/**
 * The date-fns locale for each app locale, extended with react-day-picker's
 * translated calendar labels. Pass it to `Calendar`/`DateField` and to
 * date-fns `format`.
 */
export const dateLocales: Record<Locale, DayPickerLocale> = {
  en: enUS,
  th,
};
