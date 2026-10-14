"use client";

import { Button } from "@acme/ui/button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export function GoBackBtn() {
  const { t } = useTranslation();
  const router = useRouter();
  const handleGoBack = useCallback(() => router.back(), [router]);
  return (
    <Button
      className="h-12 w-full gap-2"
      variant="outline"
      onClick={handleGoBack}
    >
      {t("oauth.selectOrganization.goBack")}
    </Button>
  );
}
