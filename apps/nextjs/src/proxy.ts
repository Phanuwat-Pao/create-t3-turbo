import { match as matchLocale } from "@formatjs/intl-localematcher";
import { getSessionCookie } from "better-auth/cookies";
import Negotiator from "negotiator";
import { NextResponse, type NextRequest } from "next/server";

import { i18n } from "./i18n/i18n-config";

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  for (const [key, value] of request.headers) {
    negotiatorHeaders[key] = value;
  }

  const locales = [...i18n.locales];

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

const publicRoutes = [""];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  if (
    pathname.slice(3) === "" ||
    publicRoutes.some((route) => pathname.slice(3).startsWith(route))
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(
      new URL(`${pathname.slice(0, 3)}/sign-in`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // oxlint-disable-next-line unicorn/prefer-string-raw
  matcher: ["/((?!.*\\..*|_next|api).*)", "/"],
};
