import "server-only";
import { headers } from "next/headers";

import { auth } from "~/auth/server";
import { localizedRedirect } from "~/i18n/server";

/**
 * Sends a signed-out visitor to sign-in, then back to the code entry page
 * with the code they arrived with, so a code from a QR link survives.
 */
export async function requireDeviceSession(userCode?: string | string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    return session;
  }
  const code = Array.isArray(userCode) ? userCode[0] : userCode;
  const callback = code
    ? `/device?${new URLSearchParams({ user_code: code })}`
    : "/device";
  return localizedRedirect(
    `/sign-in?${new URLSearchParams({ callbackUrl: callback })}`
  );
}
