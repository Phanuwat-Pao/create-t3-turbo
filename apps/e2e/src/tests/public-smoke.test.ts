import { expect, test } from "@playwright/test";

test("public sign-in flow is reachable for unauthenticated users", async ({
  page,
}) => {
  await page.goto("/en/sign-in");

  await expect(
    page.getByText("Enter your email below to login to your account")
  ).toBeVisible();
  await expect(page.locator("#sign-in-email")).toBeVisible();
  await expect(page.locator("#sign-in-password")).toBeVisible();
  await expect(page.locator("#sign-in-remember")).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

  await page.goto("/en/dashboard");

  await expect(page).toHaveURL(/\/en\/sign-in(?:\?.*)?$/u);
  await expect(
    page.getByText("Enter your email below to login to your account")
  ).toBeVisible();
});

// Next.js gzips route-handler answers itself. A second gzip layer (oRPC's
// CompressionPlugin in /api/rpc or /api/rest) still returns status 200, but
// the browser removes one layer and the client cannot parse the rest.
test("API answers decode to JSON in the browser", async ({ page }) => {
  await page.goto("/en/sign-in");

  const answers = await page.evaluate(async () => {
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- page.evaluate sends this callback to the browser, where it can't reach module scope
    const read = async (url: string, init?: RequestInit) => {
      const res = await fetch(url, init);
      const text = await res.text();
      try {
        JSON.parse(text);
        return { ok: true, status: res.status, url };
      } catch {
        return { ok: false, status: res.status, url };
      }
    };
    const rpc = (path: string) =>
      read(`/api/rpc/${path}`, {
        body: JSON.stringify({ json: {} }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
    return Promise.all([
      rpc("health/liveness"),
      rpc("auth/getSession"),
      rpc("auth/getSecretMessage"),
      read("/api/rest/health/liveness"),
    ]);
  });

  expect(answers).toStrictEqual([
    { ok: true, status: 200, url: "/api/rpc/health/liveness" },
    { ok: true, status: 200, url: "/api/rpc/auth/getSession" },
    { ok: true, status: 401, url: "/api/rpc/auth/getSecretMessage" },
    { ok: true, status: 200, url: "/api/rest/health/liveness" },
  ]);
});
