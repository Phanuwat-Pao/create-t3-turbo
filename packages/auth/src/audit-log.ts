import { db } from "@acme/db/client";
import { AuditLog } from "@acme/db/schema";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";

/**
 * Auth events recorded by the self-hosted audit log. Mirrors the event names
 * Better Auth Infrastructure uses so the vocabulary stays familiar, but rows
 * land in our own Postgres `audit_log` table instead of their cloud.
 */
const ACTION_BY_PATH: Record<string, string> = {
  "/change-password": "password_changed",
  "/delete-user": "user_deleted",
  "/forget-password": "password_reset_requested",
  "/organization/accept-invitation": "invite_accepted",
  "/organization/cancel-invitation": "invite_cancelled",
  "/organization/create": "organization_created",
  "/organization/invite-member": "member_invited",
  "/organization/reject-invitation": "invite_rejected",
  "/organization/remove-member": "member_removed",
  "/organization/update": "organization_updated",
  "/reset-password": "password_reset_completed",
  "/sign-in/email": "user_signed_in",
  "/sign-in/username": "user_signed_in",
  "/sign-out": "user_signed_out",
  "/sign-up/email": "user_signed_up",
  "/two-factor/disable": "two_factor_disabled",
  "/two-factor/enable": "two_factor_enabled",
  "/update-user": "user_profile_updated",
};

function resolveAction(path: string | undefined): string | null {
  if (!path) {
    return null;
  }
  const mapped = ACTION_BY_PATH[path];
  if (mapped) {
    return mapped;
  }
  // Social/OAuth sign-in callbacks and passkey authentication
  if (path.startsWith("/callback/") || path.startsWith("/oauth2/callback/")) {
    return "user_signed_in";
  }
  if (path.includes("/passkey/verify-authentication")) {
    return "user_signed_in";
  }
  return null;
}

/**
 * Self-hosted audit logging: an after-hook that records auth events into the
 * `audit_log` table. Inserts are best-effort — a logging failure must never
 * break the auth flow itself.
 */
export const auditLog = () =>
  ({
    hooks: {
      after: [
        {
          handler: createAuthMiddleware(async (ctx) => {
            const action = resolveAction(ctx.path);
            if (!action) {
              return;
            }

            const session = ctx.context.newSession ?? ctx.context.session;
            const headers = ctx.request?.headers ?? ctx.headers;

            try {
              await db.insert(AuditLog).values({
                action,
                ipAddress:
                  headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                  null,
                metadata: { path: ctx.path },
                userAgent: headers?.get("user-agent") ?? null,
                userId: session?.user.id ?? null,
              });
            } catch (error) {
              console.error("[audit-log] failed to record event", error);
            }
          }),
          matcher: (ctx) => resolveAction(ctx.path) !== null,
        },
      ],
    },
    id: "audit-log",
  }) satisfies BetterAuthPlugin;
