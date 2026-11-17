import { createServer, type Server } from "node:net";

import { memoryAdapter } from "better-auth/adapters/memory";

import type { Auth } from "./index";
import { errorCodeTranslations, otherCodeTranslations } from "./translations";

const BASE_URL = "http://localhost:3000";

// initAuth does reach the database: Better Auth runs plugin init as soon as
// the instance is built, and the oauthProvider plugin seeds its `resources`
// row in `oauth_resource` there. Better Auth's in-memory adapter takes the
// Drizzle adapter's place, so the real initAuth (and its real plugin list,
// hence the real `$ERROR_CODES`) runs without Postgres.
vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: () => memoryAdapter({ oauthResource: [] }),
}));

// A TCP listener stands in for Postgres and counts connections: building the
// instance and answering the requests below must open none.
let database: Server;
let connections = 0;
let auth: Auth;

beforeAll(async () => {
  database = createServer((socket) => {
    connections += 1;
    socket.destroy();
  });
  await new Promise<void>((resolve) => {
    database.listen(0, "127.0.0.1", resolve);
  });
  const address = database.address();
  if (!address || typeof address === "string") {
    throw new Error("listener has no port");
  }
  process.env.POSTGRES_URL = `postgresql://test:test@127.0.0.1:${address.port}/test`;
  const { initAuth } = await import("./index");
  auth = initAuth({
    baseUrl: BASE_URL,
    productionUrl: BASE_URL,
    secret: "test-secret-that-is-at-least-32-characters",
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    database.close(() => resolve());
  });
});

async function signInWithUnconfiguredProvider(headers: Record<string, string>) {
  const response = await auth.handler(
    new Request(`${BASE_URL}/api/auth/sign-in/social`, {
      body: JSON.stringify({ provider: "facebook" }),
      headers: {
        "content-type": "application/json",
        origin: BASE_URL,
        ...headers,
      },
      method: "POST",
    })
  );
  return {
    body: (await response.json()) as { code?: string; message?: string },
    status: response.status,
  };
}

describe("Better Auth Thai error messages", () => {
  it("translates every code in the auth instance's $ERROR_CODES", () => {
    const codes = Object.keys(auth.$ERROR_CODES);
    // A sanity floor: core alone has ~50, the plugins ~130 more.
    expect(codes.length).toBeGreaterThan(150);
    const missing = codes.filter((code) => !errorCodeTranslations[code]);
    expect(missing).toEqual([]);
  });

  it("lists only real $ERROR_CODES in errorCodeTranslations", () => {
    const codes = new Set(Object.keys(auth.$ERROR_CODES));
    const stale = Object.keys(errorCodeTranslations).filter(
      (code) => !codes.has(code)
    );
    expect(stale).toEqual([]);
  });

  it("keeps otherCodeTranslations to codes $ERROR_CODES does not list", () => {
    const codes = new Set(Object.keys(auth.$ERROR_CODES));
    const listed = Object.keys(otherCodeTranslations).filter((code) =>
      codes.has(code)
    );
    expect(listed).toEqual([]);
  });

  it("answers in Thai when the request comes from a /th page", async () => {
    const { body, status } = await signInWithUnconfiguredProvider({
      "accept-language": "en-US,en;q=0.9",
      referer: `${BASE_URL}/th/sign-in`,
    });
    expect(status).toBe(404);
    expect(body.code).toBe("PROVIDER_NOT_FOUND");
    expect(body.message).toBe(errorCodeTranslations.PROVIDER_NOT_FOUND);
  });

  it("answers in English on /en pages, even for a Thai browser", async () => {
    const { body } = await signInWithUnconfiguredProvider({
      "accept-language": "th-TH,th;q=0.9",
      referer: `${BASE_URL}/en/sign-in`,
    });
    expect(body.message).toBe("Provider not found");
  });

  it("falls back to Accept-Language without a locale in the Referer", async () => {
    const { body } = await signInWithUnconfiguredProvider({
      "accept-language": "th-TH,th;q=0.9,en;q=0.8",
    });
    expect(body.message).toBe(errorCodeTranslations.PROVIDER_NOT_FOUND);
  });

  it("never touched the database", () => {
    expect(connections).toBe(0);
  });
});
