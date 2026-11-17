"use client";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import Link from "~/components/link";

export function InvitationError() {
  const { t } = useTranslation();
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-destructive h-6 w-6" />
          <CardTitle className="text-destructive text-xl">
            {t("organization.invitation.errorTitle")}
          </CardTitle>
        </div>
        <CardDescription>
          {t("organization.invitation.errorDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-sm">
          {t("organization.invitation.errorBody")}
        </p>
      </CardContent>
      <CardFooter>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full">
            {t("organization.invitation.goHome")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
