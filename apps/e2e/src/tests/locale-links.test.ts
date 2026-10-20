import { expect, test } from "@playwright/test";

// Every in-app link must already carry a locale. A locale-less href still
// works through the proxy's redirect, but Next's segment prefetches do not
// survive that redirect and every click pays an extra round trip.
const isLocaleLess = (href: string) =>
  href.startsWith("/") &&
  !href.startsWith("//") &&
  !/^\/(?:th|en)(?:[/?#]|$)/u.test(href) &&
  !href.startsWith("/api/") &&
  !/\/[^/?#]*\.[^/?#]+(?:[?#].*)?$/u.test(href);

for (const path of [
  "/th",
  "/en/pricing",
  "/th/sign-in",
  "/en/forget-password",
]) {
  test(`links on ${path} carry a locale`, async ({ page }) => {
    await page.goto(path);
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

    expect(
      hrefs.filter(
        (href): href is string => href !== null && isLocaleLess(href)
      )
    ).toEqual([]);
  });
}
