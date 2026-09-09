/** `x-forwarded-*` headers carry a comma-separated hop list; the first is the client-facing one. */
function firstValue(header: string | null): string | undefined {
  const value = header?.split(",")[0]?.trim();
  return value || undefined;
}

function isLocalHost(host: string): boolean {
  const hostname = host.replace(/:\d+$/u, "");
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

/**
 * Origin of the request that is currently being served, from the forwarded
 * headers the ingress (or Next itself) sets. Every host the app is reached
 * on, `www` or bare, gets URLs that point back at itself, so the sitemap,
 * canonicals and Open Graph tags never advertise a domain the visitor did
 * not use.
 *
 * Kept free of `next/headers` and the env module so it can be unit tested.
 */
export function siteUrlFromHeaders(requestHeaders: Headers): URL {
  const forwardedHost = firstValue(requestHeaders.get("x-forwarded-host"));
  const host = forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProto = firstValue(requestHeaders.get("x-forwarded-proto"));
  const protocol = forwardedProto ?? (isLocalHost(host) ? "http" : "https");
  return new URL(`${protocol}://${host}`);
}
