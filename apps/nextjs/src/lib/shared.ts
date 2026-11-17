import type { ReadonlyURLSearchParams } from "next/navigation";

const DEFAULT_CALLBACK = "/dashboard";

/**
 * Paths sign-in may return to, each with the query parameters it may carry.
 * `/device` keeps `user_code`, so a code from a QR link survives sign-in.
 */
const allowedCallbacks: ReadonlyMap<string, readonly string[]> = new Map([
  ["/dashboard", []],
  ["/device", ["user_code"]],
]);

export const getCallbackURL = (
  queryParams: ReadonlyURLSearchParams | URLSearchParams
): string => {
  const callbackUrl = queryParams.get("callbackUrl");
  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) {
    return DEFAULT_CALLBACK;
  }
  // The base only lets URL parse a root-relative path. A different origin
  // after parsing means the input named another host ("/\\evil.example").
  const base = "http://callback.invalid";
  const url = new URL(callbackUrl, base);
  const allowedParams = allowedCallbacks.get(url.pathname);
  if (url.origin !== base || !allowedParams) {
    return DEFAULT_CALLBACK;
  }
  const kept = new URLSearchParams();
  for (const name of allowedParams) {
    const value = url.searchParams.get(name);
    if (value) {
      kept.set(name, value);
    }
  }
  const query = kept.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
};
