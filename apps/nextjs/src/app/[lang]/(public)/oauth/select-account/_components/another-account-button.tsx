"use client";

import { Button } from "@acme/ui/button";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import Link from "~/components/link";

export function AnotherAccountBtn() {
  const { t } = useTranslation();
  const params = useSearchParams();
  return (
    <Link href={`/sign-in${params ? `?${params.toString()}` : ""}`}>
      <Button className="h-12 w-full gap-2" variant="outline">
        {t("oauth.selectAccount.anotherAccount")}
      </Button>
    </Link>
  );
}
