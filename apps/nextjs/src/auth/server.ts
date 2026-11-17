import "server-only";
import { initAuth } from "@acme/auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { cache } from "react";

import { env } from "~/env";
import { sendEmail } from "~/lib/email";

/**
 * The origin this deployment serves auth from. It is the OAuth issuer, the
 * protected resource, and the prefix of the organization claim, so the
 * metadata routes and the tokens agree on one value. `BETTER_AUTH_URL` names
 * it outside Vercel; on Vercel the system variables pick the deployment's own
 * URL.
 */
function getBaseUrl() {
  if (env.BETTER_AUTH_URL) {
    return new URL(env.BETTER_AUTH_URL).origin;
  }
  if (env.VERCEL_ENV === "production") {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_ENV === "preview") {
    return `https://${env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function getProductionUrl() {
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.BETTER_AUTH_URL) {
    return new URL(env.BETTER_AUTH_URL).origin;
  }
  return "https://turbo.t3.gg";
}

export const baseUrl = getBaseUrl();

export const auth = initAuth({
  adminUserIds: env.ADMIN_USER_IDS,
  baseUrl,
  extraPlugins: [nextCookies()],
  productionUrl: getProductionUrl(),
  secret: env.AUTH_SECRET,
  sendEmail,
  trustedOrigins: env.TRUSTED_ORIGINS,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
