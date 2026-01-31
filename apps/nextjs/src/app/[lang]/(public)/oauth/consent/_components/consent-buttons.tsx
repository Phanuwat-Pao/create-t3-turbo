"use client";

import { Button } from "@acme/ui/button";
import { CardFooter } from "@acme/ui/card";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { Dictionary } from "~/i18n/get-dictionary";

import { authClient } from "~/auth/client";

interface ConsentBtnsProps {
  dict: Dictionary;
}

export function ConsentBtns({ dict }: ConsentBtnsProps) {
  const [loading, setLoading] = useState(false);

  const handleAuthorize = useCallback(async () => {
    setLoading(true);
    const res = await authClient.oauth2.consent({
      accept: true,
    });
    setLoading(false);
    if (res.data?.redirect && res.data?.uri) {
      window.location.href = res.data?.uri;
      return;
    }
    toast.error(dict.oauth.consent.authorizeFailed);
  }, [dict.oauth.consent.authorizeFailed]);

  const handleCancel = useCallback(async () => {
    const res = await authClient.oauth2.consent({
      accept: false,
    });
    if (res.data?.redirect && res.data?.uri) {
      window.location.href = res.data?.uri;
      return;
    }
    toast.error(dict.oauth.consent.cancelFailed);
  }, [dict.oauth.consent.cancelFailed]);

  return (
    <CardFooter className="flex items-center gap-2">
      <Button onClick={handleAuthorize}>
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          dict.oauth.consent.authorizeButton
        )}
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        {dict.oauth.consent.cancelButton}
      </Button>
    </CardFooter>
  );
}
