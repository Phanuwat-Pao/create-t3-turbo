import "server-only";
import { initAuth } from "@acme/auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { cache } from "react";

import { env } from "~/env";
import { sendEmail } from "~/lib/email";

function getBaseUrl() {
  if (env.VERCEL_ENV === "production") {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_ENV === "preview") {
    return `https://${env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const auth = initAuth({
  baseUrl: getBaseUrl(),
  extraPlugins: [nextCookies()],
  productionUrl: `https://${env.VERCEL_PROJECT_PRODUCTION_URL ?? "turbo.t3.gg"}`,
  secret: env.AUTH_SECRET,
  sendEmail,
  trustedOrigins: env.TRUSTED_ORIGINS,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
