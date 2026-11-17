import { resolveRequestLocale } from "./locale";

function request(headers: Record<string, string>) {
  return new Request("http://localhost:3000/api/auth/sign-in/email", {
    headers,
  });
}

describe("resolveRequestLocale", () => {
  it("takes the locale from the Referer's first path segment", () => {
    expect(
      resolveRequestLocale(
        request({
          "accept-language": "en-US,en;q=0.9",
          referer: "http://localhost:3000/th/sign-in",
        })
      )
    ).toBe("th");
    expect(
      resolveRequestLocale(
        request({
          "accept-language": "th-TH,th;q=0.9",
          referer: "http://localhost:3000/en/dashboard?tab=1",
        })
      )
    ).toBe("en");
  });

  it("falls back to the best Accept-Language match", () => {
    expect(
      resolveRequestLocale(
        request({
          "accept-language": "fr-FR,fr;q=0.9,th;q=0.8,en;q=0.7",
          referer: "http://localhost:3000/pricing",
        })
      )
    ).toBe("th");
    expect(
      resolveRequestLocale(request({ "accept-language": "th;q=0.5,en;q=0.6" }))
    ).toBe("en");
    expect(resolveRequestLocale(request({ "accept-language": "TH-th" }))).toBe(
      "th"
    );
    expect(
      resolveRequestLocale(request({ "accept-language": "th;q=0,en" }))
    ).toBe("en");
  });

  it("defaults to English", () => {
    expect(resolveRequestLocale(request({}))).toBe("en");
    expect(
      resolveRequestLocale(
        request({ "accept-language": "de", referer: "not a url" })
      )
    ).toBe("en");
    expect(resolveRequestLocale(undefined)).toBe("en");
    expect(resolveRequestLocale({ headers: undefined })).toBe("en");
  });

  it("reads endpoint contexts, which carry headers without a Request", () => {
    expect(
      resolveRequestLocale({
        headers: new Headers({ referer: "https://app.example/th/two-factor" }),
      })
    ).toBe("th");
  });
});
