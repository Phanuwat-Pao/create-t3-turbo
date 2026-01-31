"use client";

import { Alert, AlertDescription } from "@acme/ui/alert";
import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import type { Dictionary } from "~/i18n/get-dictionary";

import { authClient } from "~/auth/client";

interface DeviceAuthClientProps {
  dict: Dictionary;
}

export function DeviceAuthClient({ dict }: DeviceAuthClientProps) {
  const router = useRouter();
  const params = useSearchParams();
  const user_code = params.get("user_code");
  const [userCode, setUserCode] = useState<string>(user_code || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      startTransition(async () => {
        try {
          const finalCode = userCode.trim().replaceAll("-", "").toUpperCase();
          // Get the device authorization status
          const response = await authClient.device({
            query: {
              user_code: finalCode,
            },
          });

          if (response.data) {
            router.push(`/device/approve?user_code=${finalCode}`);
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : dict.device.invalidCode;
          setError(message);
        }
      });
    },
    [dict.device.invalidCode, router, userCode]
  );

  const handleUserCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserCode(e.target.value);
    },
    []
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{dict.device.title}</h1>
            <p className="text-muted-foreground mt-2">
              {dict.device.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userCode">{dict.device.codeLabel}</Label>
              <Input
                id="userCode"
                type="text"
                placeholder={dict.device.codePlaceholder}
                value={userCode}
                onChange={handleUserCodeChange}
                className="text-center font-mono text-lg uppercase"
                maxLength={9}
                disabled={isPending}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dict.device.verifying}
                </>
              ) : (
                dict.device.continueButton
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
