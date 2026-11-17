/** Languages the server speaks: error messages and emails. */
export const AUTH_LOCALES = ["en", "th"] as const;

export type AuthLocale = (typeof AUTH_LOCALES)[number];

const DEFAULT_AUTH_LOCALE: AuthLocale = "en";

function isAuthLocale(value: string | undefined): value is AuthLocale {
  return (AUTH_LOCALES as readonly string[]).includes(value ?? "");
}

/** The web app's routes start with the locale (/th/sign-in, /en/dashboard). */
function fromReferer(referer: string | null): AuthLocale | null {
  if (!referer) {
    return null;
  }
  try {
    const [, segment] = new URL(referer).pathname.split("/");
    return isAuthLocale(segment) ? segment : null;
  } catch {
    return null;
  }
}

/** The supported language the client ranks highest, ignoring region subtags. */
function fromAcceptLanguage(header: string | null): AuthLocale | null {
  if (!header) {
    return null;
  }
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const qParam = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      const quality = qParam ? Number(qParam.slice(2)) : 1;
      return {
        index,
        language: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry) => entry.quality > 0)
    .toSorted((a, b) => b.quality - a.quality || a.index - b.index);
  for (const { language } of ranked) {
    if (isAuthLocale(language)) {
      return language;
    }
  }
  return null;
}

/**
 * The language to answer a request in. The web app's locale is path-based,
 * so the Referer's first path segment wins; Accept-Language covers Expo and
 * direct API callers; English is the fallback.
 *
 * Takes a `Request`, a Better Auth endpoint context (both carry `headers`),
 * or nothing: server-side `auth.api` calls may have no request at all.
 */
export function resolveRequestLocale(
  request: { headers?: Headers | null } | null | undefined
): AuthLocale {
  const headers = request?.headers;
  if (!headers) {
    return DEFAULT_AUTH_LOCALE;
  }
  return (
    fromReferer(headers.get("referer")) ??
    fromAcceptLanguage(headers.get("accept-language")) ??
    DEFAULT_AUTH_LOCALE
  );
}
