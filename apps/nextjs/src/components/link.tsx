"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

import { withLocale } from "~/i18n/localized-path";
import { useLocale } from "~/i18n/use-locale";

/**
 * next/link that keeps the visitor's language: in-app paths get the current
 * `[lang]` in front. The proxy would redirect a locale-less path anyway, but
 * Next's segment prefetches do not survive that redirect and every click
 * would pay an extra round trip.
 */
export default function Link({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const localized =
    typeof href === "string"
      ? withLocale(href, locale)
      : {
          ...href,
          pathname: href.pathname
            ? withLocale(href.pathname, locale)
            : href.pathname,
        };
  return <NextLink href={localized} {...props} />;
}
