"use client";

import { useTranslation } from "react-i18next";

export const LastUsedIndicator = () => {
  const { t } = useTranslation();
  return (
    <span className="pointer-events-none absolute -right-3 ml-auto rounded-md bg-blue-200 px-2 py-1 text-[0.5rem] font-medium text-blue-900 dark:bg-blue-600 dark:text-blue-100">
      {t("auth.signIn.lastUsed")}
    </span>
  );
};
