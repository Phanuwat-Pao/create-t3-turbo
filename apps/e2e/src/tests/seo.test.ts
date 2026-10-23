import { type APIRequestContext, expect, test } from "@playwright/test";

/**
 * Sitemap and robots must advertise URLs on whichever host served them, so
 * a www and a bare-domain deployment each get a self-consistent sitemap.
 * The forwarded headers stand in for the ingress in front of the app.
 */
const HOSTS = ["www.example.test", "example.test"];
const SITEMAP_LOC = /<loc>(?<url>[^<]+)<\/loc>/gu;
const OG_IMAGE = /<meta property="og:image" content="(?<url>[^"]+)"/u;

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

interface ShareImage {
  contentType: string | undefined;
  path: string;
}

// One page at a time on purpose. Parallel first hits make `next dev` compile
// several routes at once, and a request that reads a manifest mid-write keeps
// failing with a 500, which also breaks the tests running beside this one.
async function shareImages(
  request: APIRequestContext,
  paths: readonly string[],
  index = 0,
  found: readonly ShareImage[] = []
): Promise<ShareImage[]> {
  const path = paths[index];
  if (path === undefined) {
    return [...found];
  }
  const pageResponse = await request.get(path);
  const html = await pageResponse.text();
  const image = OG_IMAGE.exec(html)?.groups?.url;
  const imageResponse = image ? await request.get(image) : null;
  return shareImages(request, paths, index + 1, [
    ...found,
    { contentType: imageResponse?.headers()["content-type"], path },
  ]);
}

// pageMetadata sets openGraph, and Next then drops the image that
// [lang]/opengraph-image added unless the page's folder re-exports it.
// Walking the sitemap covers every indexable page, including later ones.
test("every page in the sitemap has a working share image", async ({
  request,
}) => {
  // Each page and its image route compile on first hit in `next dev`.
  test.slow();
  const sitemapResponse = await request.get("/sitemap.xml");
  const sitemap = await sitemapResponse.text();
  const paths = [...sitemap.matchAll(SITEMAP_LOC)].map(
    (match) => new URL(match.groups?.url ?? "").pathname
  );
  expect(paths).toContain("/en/pricing");
  expect(await shareImages(request, paths)).toEqual(
    paths.map((path) => ({ contentType: "image/png", path }))
  );
});

test("account flows are excluded from the index", async ({ page }) => {
  await page.goto("/en/two-factor");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/u
  );
});
