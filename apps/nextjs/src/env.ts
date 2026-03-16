import { authEnv } from "@acme/auth/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NODE_ENV: process.env.NODE_ENV,
  },
  extends: [authEnv(), vercel()],
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    EMAIL_PASS: z.string(),
    EMAIL_USER: z.string(),
    POSTGRES_URL: z.url(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    S3_DOWNLOAD_URL_EXPIRES_IN: z
      .string()
      .optional()
      .transform((value) => (value ? Number.parseInt(value, 10) : 900))
      .pipe(z.int().positive()),
    S3_ENDPOINT: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined)
      .pipe(z.url().optional()),
    S3_FORCE_PATH_STYLE: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    S3_REGION: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_UPLOAD_URL_EXPIRES_IN: z
      .string()
      .optional()
      .transform((value) => (value ? Number.parseInt(value, 10) : 900))
      .pipe(z.int().positive()),
    TRUSTED_ORIGINS: z
      .string()
      .optional()
      .transform((s) => (s ? s.split(",").map((o) => o.trim()) : []))
      .pipe(z.array(z.string())),
  },
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
