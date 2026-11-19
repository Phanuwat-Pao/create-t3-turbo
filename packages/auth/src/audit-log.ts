import { db } from "@acme/db/client";
import { AuditLog } from "@acme/db/schema";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware, isAPIError } from "better-auth/api";

/**
 * Auth events recorded by the self-hosted audit log. Mirrors the event names
 * Better Auth Infrastructure uses so the vocabulary stays familiar, but rows
 * land in our own Postgres `audit_log` table instead of their cloud. The web
 * app's audit log card has a label for each.
 */
export const AUDIT_LOG_ACTIONS = [
  "invite_accepted",
  "invite_cancelled",
  "invite_rejected",
  "member_invited",
  "member_removed",
  "organization_created",
  "organization_updated",
  "password_changed",
  "password_reset_completed",
  "password_reset_requested",
  "two_factor_disabled",
  "two_factor_enabled",
  "user_deleted",
  "user_profile_updated",
  "user_signed_in",
  "user_signed_out",
  "user_signed_up",
] as const;

export type AuditLogAction = (typeof AUDIT_LOG_ACTIONS)[number];

const ACTION_BY_PATH: Record<string, AuditLogAction> = {
  "/change-password": "password_changed",
  "/delete-user": "user_deleted",
  "/organization/accept-invitation": "invite_accepted",
  "/organization/cancel-invitation": "invite_cancelled",
  "/organization/create": "organization_created",
  "/organization/invite-member": "member_invited",
  "/organization/reject-invitation": "invite_rejected",
  "/organization/remove-member": "member_removed",
  "/one-tap/callback": "user_signed_in",
  "/organization/update": "organization_updated",
  "/request-password-reset": "password_reset_requested",
  "/reset-password": "password_reset_completed",
  "/sign-in/email": "user_signed_in",
  "/sign-in/username": "user_signed_in",
  "/sign-out": "user_signed_out",
  "/sign-up/email": "user_signed_up",
  "/two-factor/disable": "two_factor_disabled",
  "/two-factor/enable": "two_factor_enabled",
  "/two-factor/verify-backup-code": "user_signed_in",
  "/two-factor/verify-otp": "user_signed_in",
  "/two-factor/verify-totp": "user_signed_in",
  "/update-user": "user_profile_updated",
};

/**
 * The second step of a two-factor sign-in. The same endpoints confirm 2FA
 * enrolment, which also issues a new session, but enrolment runs while
 * signed in; a sign-in has no session until the code checks out.
 */
const TWO_FACTOR_VERIFY_PATHS = new Set([
  "/two-factor/verify-backup-code",
  "/two-factor/verify-otp",
  "/two-factor/verify-totp",
]);

function resolveAction(path: string | undefined): AuditLogAction | null {
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
 * `audit_log` table. Inserts are best-effort. A logging failure must never
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

            // A failed request did not do what the action says. Redirects are
            // APIErrors too (social callbacks end in a 302), so only error
            // statuses count as failures.
            const { newSession, returned } = ctx.context;
            if (isAPIError(returned) && returned.statusCode >= 400) {
              return;
            }
            // Callbacks report failure through their redirect target, and a
            // sign-in that still needs a second factor has no session yet, so
            // only a new session proves a sign-in happened.
            if (action === "user_signed_in" && !newSession) {
              return;
            }
            if (
              ctx.path &&
              TWO_FACTOR_VERIFY_PATHS.has(ctx.path) &&
              ctx.context.session
            ) {
              return;
            }

            const returnedUser = (returned as { user?: { id?: unknown } })
              ?.user;
            const userId =
              (newSession ?? ctx.context.session)?.user.id ??
              (typeof returnedUser?.id === "string" ? returnedUser.id : null);
            const headers = ctx.request?.headers ?? ctx.headers;

            try {
              await db.insert(AuditLog).values({
                action,
                ipAddress:
                  headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
                  null,
                metadata: { path: ctx.path },
                userAgent: headers?.get("user-agent") ?? null,
                userId,
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
