import { siteUrlFromHeaders } from "./site-url-from-headers";

function headersOf(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

describe("siteUrlFromHeaders", () => {
  it("uses the forwarded host and protocol when the ingress sets them", () => {
    const url = siteUrlFromHeaders(
      headersOf({
        host: "10.0.0.5:3000",
        "x-forwarded-host": "www.example.com",
        "x-forwarded-proto": "https",
      })
    );
    expect(url.origin).toBe("https://www.example.com");
  });

  it("keeps the bare domain when that is what the visitor used", () => {
    const url = siteUrlFromHeaders(
      headersOf({
        "x-forwarded-host": "example.com",
        "x-forwarded-proto": "https",
      })
    );
    expect(url.origin).toBe("https://example.com");
  });

  it("takes the first hop of a comma-separated forwarded list", () => {
    const url = siteUrlFromHeaders(
      headersOf({
        "x-forwarded-host": "www.example.com, internal-proxy",
        "x-forwarded-proto": "https, http",
      })
    );
    expect(url.origin).toBe("https://www.example.com");
  });

  it("falls back to the Host header with https for public hosts", () => {
    const url = siteUrlFromHeaders(headersOf({ host: "example.com" }));
    expect(url.origin).toBe("https://example.com");
  });

  it("falls back to http for localhost", () => {
    expect(
      siteUrlFromHeaders(headersOf({ host: "localhost:3000" })).origin
    ).toBe("http://localhost:3000");
    expect(
      siteUrlFromHeaders(headersOf({ host: "127.0.0.1:3000" })).origin
    ).toBe("http://127.0.0.1:3000");
  });

  it("defaults to localhost when no host header is present", () => {
    expect(siteUrlFromHeaders(headersOf({})).origin).toBe(
      "http://localhost:3000"
    );
  });
});
