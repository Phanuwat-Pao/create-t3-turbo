"use client";

import { Button } from "@acme/ui/button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { Dictionary } from "~/i18n/get-dictionary";

interface GoBackBtnProps {
  dict: Dictionary;
}

export function GoBackBtn({ dict }: GoBackBtnProps) {
  const router = useRouter();
  const handleGoBack = useCallback(() => router.back(), [router]);
  return (
    <Button
      className="h-12 w-full gap-2"
      variant="outline"
      onClick={handleGoBack}
    >
      {dict.oauth.selectOrganization.goBack}
    </Button>
  );
}
