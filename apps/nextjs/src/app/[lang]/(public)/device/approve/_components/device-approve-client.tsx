"use client";

import { deviceClients } from "@acme/auth/device-clients";
import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import { Check, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

import { authClient } from "~/auth/client";
import { useDeviceRequestQuery } from "~/data/device/device-request-query";
import { useSessionQuery } from "~/data/user/session-query";
import { withLocale } from "~/i18n/localized-path";
import { useLocale } from "~/i18n/use-locale";

// Errors that mean the code itself is no longer usable, as opposed to a
// failure worth retrying.
const SPENT_CODE_ERRORS = new Set([
  "device_code_already_processed",
  "expired_token",
  "invalid_request",
]);

export function DeviceApproveClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code");
  const { data: session } = useSessionQuery();
  const deviceRequest = useDeviceRequestQuery(userCode ?? "", !!session);
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isDenyPending, startDenyTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const request =
    deviceRequest.data?.kind === "pending" ? deviceRequest.data : null;
  const rejected = deviceRequest.data?.kind === "rejected";
  let lookupError: string | null = null;
  if (deviceRequest.isError) {
    lookupError = t("device.lookupUnavailable");
  } else if (rejected) {
    lookupError = t("device.lookupRejected");
  }
  const placeholder =
    deviceRequest.isError || rejected
      ? t("device.unavailable")
      : t("device.loading");

  const handleApprove = useCallback(() => {
    if (!userCode) {
      return;
    }

    setErrorMessage(null);

    startApproveTransition(async () => {
      try {
        const { error } = await authClient.device.approve({ userCode });
        if (error) {
          setErrorMessage(
            SPENT_CODE_ERRORS.has(error.error)
              ? t("device.lookupRejected")
              : t("device.failedToApprove")
          );
          return;
        }
        router.push(withLocale("/device/success", locale));
      } catch {
        setErrorMessage(t("device.failedToApprove"));
      }
    });
  }, [t, locale, router, userCode]);

  const handleDeny = useCallback(() => {
    if (!userCode) {
      return;
    }

    setErrorMessage(null);

    startDenyTransition(async () => {
      try {
        const { error } = await authClient.device.deny({ userCode });
        if (error) {
          setErrorMessage(
            SPENT_CODE_ERRORS.has(error.error)
              ? t("device.lookupRejected")
              : t("device.failedToDeny")
          );
          return;
        }
        router.push(withLocale("/device/denied", locale));
      } catch {
        setErrorMessage(t("device.failedToDeny"));
      }
    });
  }, [t, locale, router, userCode]);

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t("device.approveTitle")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("device.approveDescription")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">{t("device.codeLabel")}</p>
              <p className="font-mono text-lg">{userCode}</p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">
                {t("device.requestingClient")}
              </p>
              {request ? (
                <>
                  <p>
                    {deviceClients.get(request.clientId) ??
                      t("device.unrecognizedClient")}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {t("device.clientIdSent", { clientId: request.clientId })}
                  </p>
                </>
              ) : (
                <p>{placeholder}</p>
              )}
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">
                {t("device.requestedScopes")}
              </p>
              <p>
                {request ? request.scope || t("device.noScopes") : placeholder}
              </p>
            </div>

            <p className="text-muted-foreground text-sm">
              {t("device.approveWarning")}
            </p>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">{t("device.signedInAs")}</p>
              <p>{session.user.email}</p>
            </div>

            {(errorMessage ?? lookupError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errorMessage ?? lookupError}
                </AlertDescription>
              </Alert>
            )}

            {deviceRequest.isError && (
              <Button
                variant="outline"
                className="w-full"
                disabled={deviceRequest.isFetching}
                onClick={() => deviceRequest.refetch()}
              >
                {t("device.tryAgain")}
              </Button>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDeny}
                variant="outline"
                className="flex-1"
                disabled={isDenyPending}
              >
                {isDenyPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    {t("device.denyButton")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1"
                disabled={isApprovePending || !request}
              >
                {isApprovePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t("device.approveButton")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
