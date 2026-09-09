import { expect, test } from "@playwright/test";

/**
 * Sitemap and robots must advertise URLs on whichever host served them, so
 * a www and a bare-domain deployment each get a self-consistent sitemap.
 * The forwarded headers stand in for the ingress in front of the app.
 */
const HOSTS = ["www.example.test", "example.test"];

for (const host of HOSTS) {
  test(`sitemap.xml lists URLs on ${host}`, async ({ request }) => {
    const response = await request.get("/sitemap.xml", {
      headers: { "x-forwarded-host": host, "x-forwarded-proto": "https" },
    });
    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toContain(`<loc>https://${host}/en</loc>`);
    expect(body).toContain(`<loc>https://${host}/th</loc>`);
    expect(body).toContain(`<loc>https://${host}/en/pricing</loc>`);
    expect(body).toContain(
      `hreflang="x-default" href="https://${host}/th/pricing"`
    );
    const otherHost = HOSTS.find((candidate) => candidate !== host);
    expect(body).not.toContain(`https://${otherHost}/`);
  });

  test(`robots.txt points at the sitemap on ${host}`, async ({ request }) => {
    const response = await request.get("/robots.txt", {
      headers: { "x-forwarded-host": host, "x-forwarded-proto": "https" },
    });
    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toContain(`Sitemap: https://${host}/sitemap.xml`);
    expect(body).toContain("Disallow: /*/dashboard");
  });
}

test("home page carries canonical, hreflang and Open Graph tags", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/en$/u
  );
  await expect(page.locator('link[hreflang="th"]')).toHaveAttribute(
    "href",
    /\/th$/u
  );
  await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
    "href",
    /\/th$/u
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/u
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  // <script> has no visible text, so read its content rather than using toContainText.
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(jsonLd).toContain('"@type":"WebSite"');
});

test("account flows are excluded from the index", async ({ page }) => {
  await page.goto("/en/two-factor");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/u
  );
});
