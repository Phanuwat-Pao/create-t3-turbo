"use client";

import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

import type { Dictionary } from "~/i18n/get-dictionary";

interface DeviceSuccessClientProps {
  dict: Dictionary;
}

export function DeviceSuccessClient({ dict }: DeviceSuccessClientProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">{dict.device.successTitle}</h1>
            <p className="text-muted-foreground mt-2">
              {dict.device.successDescription}
            </p>
          </div>

          <p className="text-muted-foreground text-sm">
            {dict.device.successNote}
          </p>

          <Button asChild className="w-full">
            <Link href="/">{dict.device.returnHome}</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
