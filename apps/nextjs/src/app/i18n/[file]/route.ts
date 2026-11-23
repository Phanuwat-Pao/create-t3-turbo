import { i18n, type Locale } from "~/i18n/i18n-config";
import { translationFile } from "~/i18n/translation-files";

export const runtime = "nodejs";

const FILE = /^(?<lng>[a-z]{2})\.translation\.(?<hash>[0-9a-f]{12})\.json$/u;

const isLocale = (value: string | undefined): value is Locale =>
  (i18n.locales as readonly string[]).includes(value ?? "");

/**
 * One language's translations for Client Components (see ~/i18n/translation-files). The address names the words by
 * their hash, so the browser keeps the file for a year. A page rendered before a deploy asks for an old hash and gets
 * today's words, which it is told not to keep.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> }
) {
  const { file } = await context.params;
  const match = FILE.exec(file)?.groups;
  if (!(match && isLocale(match.lng))) {
    return new Response("Not found", { status: 404 });
  }
  const { body, hash } = translationFile(match.lng);
  return new Response(body, {
    headers: {
      "cache-control":
        hash === match.hash
          ? "public, max-age=31536000, immutable"
          : "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}
