import { getSessionCookie } from "better-auth/cookies";
import { createProxy } from "next-i18next/proxy";
import { NextResponse, type NextRequest } from "next/server";

import { i18n, i18nConfig } from "./i18n/i18n-config";

/**
 * Redirects locale-less paths to `/{lng}{path}`, picking the language from
 * the `i18next` cookie, then Accept-Language, then the default locale, and
 * remembers the choice in that cookie.
 */
const i18nProxy = createProxy(i18nConfig);

const publicRoutes = [""];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const response = i18nProxy(request);
  if (!pathnameHasLocale) {
    return response;
  }

  if (
    pathname.slice(3) === "" ||
    publicRoutes.some((route) => pathname.slice(3).startsWith(route))
  ) {
    return response;
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(
      new URL(`${pathname.slice(0, 3)}/sign-in`, request.url)
    );
  }

  return response;
}

export const config = {
  // oxlint-disable-next-line unicorn/prefer-string-raw
  matcher: ["/((?!.*\\..*|_next|api|.well-known).*)", "/"],
};
