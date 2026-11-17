import { translations } from "@acme/auth/translations";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import type { Metadata } from "next";

import Link from "~/components/link";
import type { Locale } from "~/i18n/i18n-config";
import { getT } from "~/i18n/server";
import { NOINDEX } from "~/lib/metadata";

type Reason =
  | "accessDenied"
  | "banned"
  | "emailNotVerified"
  | "invalidClientRequest"
  | "linkFailed"
  | "missingProfile"
  | "restart"
  | "serverError"
  | "signupDisabled"
  | "unavailable";

/**
 * The `?error=` codes Better Auth, its OAuth proxy, SSO and the OAuth
 * provider send to `onAPIError.errorURL`, grouped by what the user can do
 * about them. Upper-case codes are Better Auth API error codes; those use the
 * server's own translations instead (see `messageFor`).
 */
const REASON_BY_CODE: Readonly<Record<string, Reason>> = {
  access_denied: "accessDenied",
  account_already_linked_to_different_user: "linkFailed",
  account_not_linked: "linkFailed",
  banned: "banned",
  email_does_not_match: "linkFailed",
  email_not_found: "missingProfile",
  email_not_verified: "emailNotVerified",
  internal_server_error: "serverError",
  invalid_callback_request: "restart",
  invalid_client: "invalidClientRequest",
  invalid_code: "restart",
  invalid_profile: "missingProfile",
  invalid_redirect_uri: "invalidClientRequest",
  invalid_request: "invalidClientRequest",
  invalid_scope: "invalidClientRequest",
  invalid_state: "restart",
  invalid_target: "invalidClientRequest",
  issuer_mismatch: "restart",
  issuer_missing: "restart",
  missing_profile: "missingProfile",
  no_callback_url: "restart",
  no_code: "restart",
  nonce_binding_missing: "restart",
  oauth_provider_not_found: "unavailable",
  payload_expired: "restart",
  please_restart_the_process: "restart",
  provider_mismatch: "unavailable",
  server_error: "serverError",
  signup_disabled: "signupDisabled",
  state_mismatch: "restart",
  state_not_found: "restart",
  unable_to_create_session: "serverError",
  unable_to_create_user: "serverError",
  unable_to_get_user_info: "missingProfile",
  unable_to_link_account: "linkFailed",
  unable_to_update_account: "serverError",
  unauthorized_client: "invalidClientRequest",
  unsupported_response_type: "invalidClientRequest",
  user_creation_failed: "serverError",
};

const MAX_DESCRIPTION_LENGTH = 300;

interface PageProps {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{
    error?: string | string[];
    error_description?: string | string[];
  }>;
}

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    description: t("seo.authError.description"),
    robots: NOINDEX,
    title: t("seo.authError.title"),
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const [{ lang }, query, { t }] = await Promise.all([
    params,
    searchParams,
    getT(),
  ]);
  const code = first(query.error)?.slice(0, 100);
  const description = first(query.error_description)?.slice(
    0,
    MAX_DESCRIPTION_LENGTH
  );

  const reason = code ? REASON_BY_CODE[code] : undefined;
  // Better Auth API codes (BANNED_USER, ...) have Thai text in the server's
  // translations; English pages show the server's own English description.
  const serverMessage =
    code && lang === "th" ? translations.th[code] : description;
  let message = t("authError.generic");
  if (reason) {
    message = t(`authError.reasons.${reason}`);
  } else if (code && /^[A-Z0-9_]+$/u.test(code) && serverMessage) {
    message = serverMessage;
  }

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("authError.title")}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {code && (
          <CardContent>
            <p className="text-muted-foreground text-xs">
              {t("authError.details")}
            </p>
            <p className="font-mono text-xs break-all">{code}</p>
            {description && (
              <p className="text-muted-foreground mt-1 text-xs break-words">
                {description}
              </p>
            )}
          </CardContent>
        )}
        <CardFooter className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/sign-in">{t("authError.backToSignIn")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("authError.goHome")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
