import { createHmac } from "node:crypto";

import { memoryAdapter } from "better-auth/adapters/memory";

import type { Auth } from "./index";

const { auditRows } = vi.hoisted(() => ({
  auditRows: [] as { action: string; userId: string | null }[],
}));

// The audit log plugin writes straight to the Drizzle client; keep its rows.
vi.mock("@acme/db/client", () => ({
  db: {
    insert: () => ({
      values: (row: { action: string; userId: string | null }) => {
        auditRows.push(row);
        return Promise.resolve();
      },
    }),
  },
}));

// Better Auth's in-memory adapter replaces Postgres for every other model.
vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: () =>
    memoryAdapter({
      account: [],
      invitation: [],
      member: [],
      oauthResource: [],
      organization: [],
      session: [],
      twoFactor: [],
      user: [],
      verification: [],
    }),
}));

const BASE_URL = "http://localhost:3000";
const EMAIL = "somchai@example.com";
const PASSWORD = "correct-horse-battery";

interface SentEmail {
  locale: string;
  template: string;
  to: string;
}

const emails: SentEmail[] = [];
let auth: Auth;

/** Keeps the cookies Better Auth sets, the way a browser would. */
const cookies = new Map<string, string>();

function storeCookies(response: Response) {
  for (const header of response.headers.getSetCookie()) {
    const [pair = ""] = header.split(";");
    const index = pair.indexOf("=");
    const name = pair.slice(0, index);
    const value = pair.slice(index + 1);
    if (value === "" || /max-age=0/iu.test(header)) {
      cookies.delete(name);
    } else {
      cookies.set(name, value);
    }
  }
}

async function post(
  path: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  const response = await auth.handler(
    new Request(`${BASE_URL}/api/auth${path}`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        cookie: [...cookies]
          .map(([name, value]) => `${name}=${value}`)
          .join("; "),
        origin: BASE_URL,
        ...headers,
      },
      method: "POST",
    })
  );
  storeCookies(response);
  const json = (await response.json()) as Record<string, unknown>;
  return { json, status: response.status };
}

function fromPage(path: string) {
  return { referer: `${BASE_URL}${path}` };
}

// oxlint-disable no-bitwise -- RFC 4648 base32 and RFC 6238 TOTP are bit math
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of input.replace(/[=]+$/u, "").toUpperCase()) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** The current 6-digit, 30-second TOTP code for a base32 secret. */
function totp(secret: string): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", base32Decode(secret))
    .update(counter)
    .digest();
  const offset = (digest.at(-1) ?? 0) & 0x0f;
  const code = (digest.readUInt32BE(offset) & 0x7f_ff_ff_ff) % 1_000_000;
  return String(code).padStart(6, "0");
}
// oxlint-enable no-bitwise

function actions() {
  return auditRows.map((row) => row.action);
}

beforeAll(async () => {
  const { initAuth } = await import("./index");
  auth = initAuth({
    baseUrl: BASE_URL,
    productionUrl: BASE_URL,
    secret: "test-secret-that-is-at-least-32-characters",
    sendEmail: (options) => {
      emails.push(options);
      return Promise.resolve();
    },
  });
});

describe("auth flows", () => {
  let backupCodes: string[] = [];

  it("records the sign-up", async () => {
    const { status } = await post(
      "/sign-up/email",
      { email: EMAIL, name: "Somchai", password: PASSWORD },
      fromPage("/th/sign-in")
    );
    expect(status).toBe(200);
    expect(actions()).toEqual(["user_signed_up"]);
  });

  it("sends the verification email in the page's language", async () => {
    const { status } = await post(
      "/send-verification-email",
      { callbackURL: "/th/dashboard", email: EMAIL },
      fromPage("/th/dashboard")
    );
    expect(status).toBe(200);
    expect(emails.at(-1)).toMatchObject({
      locale: "th",
      template: "verify-email",
      to: EMAIL,
    });
  });

  it("records a password reset request and writes it in the page's language", async () => {
    const { status } = await post(
      "/request-password-reset",
      { email: EMAIL, redirectTo: "/en/reset-password" },
      { ...fromPage("/en/forget-password"), "accept-language": "th" }
    );
    expect(status).toBe(200);
    expect(emails.at(-1)).toMatchObject({
      locale: "en",
      template: "reset-password",
      to: EMAIL,
    });
    expect(actions().at(-1)).toBe("password_reset_requested");
  });

  it("does not count 2FA enrolment as a sign-in", async () => {
    const enabled = await post("/two-factor/enable", { password: PASSWORD });
    expect(enabled.status).toBe(200);
    backupCodes = enabled.json.backupCodes as string[];
    const secret = new URL(enabled.json.totpURI as string).searchParams.get(
      "secret"
    );
    expect(secret).toBeTruthy();

    const verified = await post("/two-factor/verify-totp", {
      code: totp(secret ?? ""),
    });
    expect(verified.status).toBe(200);
    expect(actions().filter((action) => action === "user_signed_in")).toEqual(
      []
    );
  });

  it("records a two-factor sign-in once the second factor checks out", async () => {
    await post("/sign-out", {});
    const signIn = await post(
      "/sign-in/email",
      { email: EMAIL, password: PASSWORD },
      fromPage("/th/sign-in")
    );
    expect(signIn.json.twoFactorRedirect).toBe(true);
    expect(actions().at(-1)).toBe("user_signed_out");

    const sent = await post(
      "/two-factor/send-otp",
      {},
      fromPage("/th/two-factor/otp")
    );
    expect(sent.status).toBe(200);
    expect(emails.at(-1)).toMatchObject({
      locale: "th",
      template: "two-factor",
      to: EMAIL,
    });

    const verified = await post("/two-factor/verify-backup-code", {
      code: backupCodes[0],
    });
    expect(verified.status).toBe(200);
    expect(actions().at(-1)).toBe("user_signed_in");
  });

  it("writes an invitation in the inviter's language", async () => {
    const created = await post(
      "/organization/create",
      { name: "Acme Thai", slug: "acme-thai" },
      fromPage("/th/dashboard")
    );
    expect(created.status).toBe(200);
    const invited = await post(
      "/organization/invite-member",
      { email: "invitee@example.com", role: "member" },
      { ...fromPage("/th/dashboard"), "accept-language": "en" }
    );
    expect(invited.status).toBe(200);
    expect(emails.at(-1)).toMatchObject({
      locale: "th",
      template: "invitation",
      to: "invitee@example.com",
    });
  });
});
