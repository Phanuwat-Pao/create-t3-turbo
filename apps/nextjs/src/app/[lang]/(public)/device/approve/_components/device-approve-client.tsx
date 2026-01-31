"use client";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import { Check, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import type { Dictionary } from "~/i18n/get-dictionary";

import { authClient } from "~/auth/client";
import { useSessionQuery } from "~/data/user/session-query";

interface DeviceApproveClientProps {
  dict: Dictionary;
}

export function DeviceApproveClient({ dict }: DeviceApproveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code");
  const { data: session } = useSessionQuery();
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isDenyPending, startDenyTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = useCallback(() => {
    if (!userCode) {
      return;
    }

    setError(null);

    startApproveTransition(async () => {
      try {
        await authClient.device.approve({
          userCode,
        });
        router.push("/device/success");
      } catch (error: unknown) {
        const errorObj = error as { error?: { message?: string } };
        setError(errorObj.error?.message ?? dict.device.failedToApprove);
      }
    });
  }, [dict.device.failedToApprove, router, userCode]);

  const handleDeny = useCallback(() => {
    if (!userCode) {
      return;
    }

    setError(null);

    startDenyTransition(async () => {
      try {
        await authClient.device.deny({
          userCode,
        });
        router.push("/device/denied");
      } catch (error: unknown) {
        const errorObj = error as { error?: { message?: string } };
        setError(errorObj.error?.message ?? dict.device.failedToDeny);
      }
    });
  }, [dict.device.failedToDeny, router, userCode]);

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{dict.device.approveTitle}</h1>
            <p className="text-muted-foreground mt-2">
              {dict.device.approveDescription}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">{dict.device.codeLabel}</p>
              <p className="font-mono text-lg">{userCode}</p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">{dict.device.signedInAs}</p>
              <p>{session.user.email}</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
                    {dict.device.denyButton}
                  </>
                )}
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1"
                disabled={isApprovePending}
              >
                {isApprovePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {dict.device.approveButton}
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
