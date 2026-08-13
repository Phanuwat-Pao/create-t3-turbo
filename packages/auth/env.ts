import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function authEnv() {
  return createEnv({
    runtimeEnv: process.env,
    server: {
      ADMIN_USER_IDS: z
        .string()
        .optional()
        .transform((s) =>
          s
            ? s
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
            : []
        )
        .pipe(z.array(z.string())),
      AUTH_SECRET:
        process.env.NODE_ENV === "production"
          ? z.string().min(1)
          : z.string().min(1).optional(),
      NODE_ENV: z.enum(["development", "production"]).optional(),
    },
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
