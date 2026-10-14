import { NextRequest } from "next/server";

import proxy from "./proxy";

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers });
}

describe("proxy locale redirect", () => {
  it("sends a locale-less path to the default locale", () => {
    const response = proxy(request("/sign-in"));
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/th/sign-in"
    );
  });

  it("follows Accept-Language when it names a supported locale", () => {
    const response = proxy(
      request("/sign-in", { "accept-language": "en-US,en;q=0.9" })
    );
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/en/sign-in"
    );
    expect(response.cookies.get("i18next")?.value).toBe("en");
  });

  it("prefers the remembered language over Accept-Language", () => {
    const response = proxy(
      request("/", { "accept-language": "en", cookie: "i18next=th" })
    );
    expect(response.headers.get("location")).toBe("http://localhost:3000/th");
  });

  it("passes a localized path through with the language header", () => {
    const response = proxy(request("/en/pricing"));
    expect(response.headers.get("location")).toBeNull();
    expect(
      response.headers.get("x-middleware-request-x-i18next-current-language")
    ).toBe("en");
  });
});
