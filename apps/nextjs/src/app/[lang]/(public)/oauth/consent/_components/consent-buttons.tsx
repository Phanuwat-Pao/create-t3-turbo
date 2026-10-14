"use client";

import { Button } from "@acme/ui/button";
import { CardFooter } from "@acme/ui/card";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

export function ConsentBtns() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleAuthorize = useCallback(async () => {
    setLoading(true);
    const res = await authClient.oauth2.consent({
      accept: true,
    });
    setLoading(false);
    if (res.data?.redirect && res.data?.url) {
      window.location.href = res.data?.url;
      return;
    }
    toast.error(t("oauth.consent.authorizeFailed"));
  }, [t]);

  const handleCancel = useCallback(async () => {
    const res = await authClient.oauth2.consent({
      accept: false,
    });
    if (res.data?.redirect && res.data?.url) {
      window.location.href = res.data?.url;
      return;
    }
    toast.error(t("oauth.consent.cancelFailed"));
  }, [t]);

  return (
    <CardFooter className="flex items-center gap-2">
      <Button onClick={handleAuthorize}>
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          t("oauth.consent.authorizeButton")
        )}
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        {t("oauth.consent.cancelButton")}
      </Button>
    </CardFooter>
  );
}
