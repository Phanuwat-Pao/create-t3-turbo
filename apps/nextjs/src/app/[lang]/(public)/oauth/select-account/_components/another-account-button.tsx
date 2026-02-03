"use client";

import { Button } from "@acme/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Dictionary } from "~/i18n/get-dictionary";

interface AnotherAccountBtnProps {
  dict: Dictionary;
}

export function AnotherAccountBtn({ dict }: AnotherAccountBtnProps) {
  const params = useSearchParams();
  return (
    <Link href={`/sign-in${params ? `?${params.toString()}` : ""}`}>
      <Button className="h-12 w-full gap-2" variant="outline">
        {dict.oauth.selectAccount.anotherAccount}
      </Button>
    </Link>
  );
}
