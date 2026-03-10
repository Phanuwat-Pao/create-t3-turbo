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

  await expect(page).toHaveURL(/\/en\/sign-in(?:\?.*)?$/);
  await expect(
    page.getByText("Enter your email below to login to your account")
  ).toBeVisible();
});
