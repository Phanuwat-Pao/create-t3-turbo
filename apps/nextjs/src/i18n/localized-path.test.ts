import { localizedPath, toLocale, withLocale } from "./localized-path";

describe("withLocale", () => {
  it.each([
    ["/", "/th"],
    ["/pricing", "/th/pricing"],
    ["/device/approve", "/th/device/approve"],
    ["/sign-in?callbackUrl=/device", "/th/sign-in?callbackUrl=/device"],
    [
      "/device/approve?user_code=ABCD1234",
      "/th/device/approve?user_code=ABCD1234",
    ],
    ["/?n=3", "/th?n=3"],
    ["/dashboard#organizations", "/th/dashboard#organizations"],
  ])("prefixes the in-app path %s", (href, expected) => {
    expect(withLocale(href, "th")).toBe(expected);
  });

  it.each([
    "/en/dashboard",
    "/th",
    "/api/auth/get-session",
    "/_next/static/chunk.js",
    "/favicon/favicon-32x32.png",
    "/favicon.ico",
    "https://better-auth.com",
    "//cdn.example.com/x",
    "#top",
    "mailto:someone@example.com",
  ])("leaves %s alone", (href) => {
    expect(withLocale(href, "en")).toBe(href);
  });
});

describe("localizedPath", () => {
  it("collapses the root", () => {
    expect(localizedPath("en", "/")).toBe("/en");
    expect(localizedPath("en", "/pricing")).toBe("/en/pricing");
  });
});

describe("toLocale", () => {
  it("falls back to the default locale", () => {
    expect(toLocale("en")).toBe("en");
    expect(toLocale("de")).toBe("th");
    expect(toLocale(undefined)).toBe("th");
  });
});
