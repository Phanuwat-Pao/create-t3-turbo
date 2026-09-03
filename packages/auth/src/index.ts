import { db } from "@acme/db/client";
import * as schema from "@acme/db/schema";
import { expo } from "@better-auth/expo";
import { i18n } from "@better-auth/i18n";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
import { scim } from "@better-auth/scim";
import { sso } from "@better-auth/sso";
import {
  type BetterAuthOptions,
  type BetterAuthPlugin,
  APIError,
  betterAuth,
} from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  type Organization,
  admin,
  bearer,
  customSession,
  deviceAuthorization,
  jwt,
  lastLoginMethod,
  multiSession,
  oAuthProxy,
  oneTap,
  openAPI,
  organization,
  twoFactor,
  username,
} from "better-auth/plugins";

import { auditLog } from "./audit-log";
import { translations } from "./translations";

const SUPPORTED_LOCALES = new Set(["th", "en"]);

export interface InitAuthOptions<
  TExtraPlugins extends BetterAuthPlugin[] = [],
> {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  adminUserIds?: string[];

  facebookClientId?: string;
  facebookClientSecret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  microsoftClientId?: string;
  microsoftClientSecret?: string;
  twitchClientId?: string;
  twitchClientSecret?: string;
  twitterClientId?: string;
  twitterClientSecret?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  vercelClientId?: string;
  vercelClientSecret?: string;

  appName?: string;
  extraPlugins?: TExtraPlugins;
  trustedOrigins?: string[];

  sendEmail?: (options: {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, string>;
  }) => Promise<void>;
}

const noopSendEmail = async () => {
  /* intentionally empty - no email provider configured */
};

export function initAuth<TExtraPlugins extends BetterAuthPlugin[] = []>(
  options: InitAuthOptions<TExtraPlugins>
) {
  const sendEmail = options.sendEmail ?? noopSendEmail;
  const appName = options.appName ?? "Better Auth App";

  const authOptions = {
    account: {
      accountLinking: {
        trustedProviders: [
          "email-password",
          "facebook",
          "github",
          "google",
          "microsoft",
          "twitch",
          "twitter",
          "paypal",
          "vercel",
        ],
      },
    },
    appName,
    baseURL: options.baseUrl,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
      // scim (and sso) require native transactions; node-postgres has them.
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }) {
        await sendEmail({
          subject: "Reset your password",
          template: "reset-password",
          to: user.email,
          variables: {
            resetLink: url,
            userEmail: user.email,
            userName: user.name,
          },
        });
      },
    },
    emailVerification: {
      async sendVerificationEmail({ user, url }) {
        await sendEmail({
          subject: "Verify your email address",
          template: "verify-email",
          to: user.email,
          variables: {
            appName,
            expirationMinutes: "10",
            userEmail: user.email,
            userName: user.name,
            verificationCode: "",
            verificationUrl: url,
          },
        });
      },
    },
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
    plugins: [
      organization({
        async sendInvitationEmail(data) {
          sendEmail({
            subject: "You've been invited to join an organization",
            template: "invitation",
            to: data.email,
            variables: {
              inviteLink:
                process.env.NODE_ENV === "development"
                  ? `http://localhost:3000/accept-invitation/${data.id}`
                  : `${options.productionUrl}/accept-invitation/${data.id}`,
              inviterEmail: data.inviter.user.email,
              inviterName: data.inviter.user.name,
              organizationName: data.organization.name,
              role: data.role,
            },
          });
        },
      }),
      twoFactor({
        otpOptions: {
          async sendOTP({ user, otp }) {
            await sendEmail({
              subject: "Your two-factor authentication code",
              template: "two-factor",
              to: user.email,
              variables: {
                appName,
                otpCode: otp,
                userEmail: user.email,
                userName: user.name,
              },
            });
          },
        },
      }),
      openAPI({
        disableDefaultReference: true,
      }),
      bearer(),
      admin({ adminUserIds: options.adminUserIds }),
      multiSession(),
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      oneTap(),
      deviceAuthorization({
        expiresIn: "3min",
        interval: "5s",
        // better-auth 1.6.20 types this plugin's `schema` option as a
        // non-optional z.custom, which rejects `undefined` under zod 4.4.x.
        // An empty object is a no-op in mergeSchema, satisfying the parser.
        schema: {},
      }),
      lastLoginMethod(),
      jwt({
        jwt: {
          issuer: options.productionUrl,
        },
      }),
      expo(),
      passkey(),
      sso(),
      scim({
        // Secure default: no provisioning connections and a deny-all token
        // verifier. Deployments declare their IdP connections (or a managed
        // connection catalog) here to enable SCIM access.
        authentication: {
          verifyBearerToken: () => null,
        },
        connections: [],
      }),
      username(),
      auditLog(),
      i18n({
        // The web app's locale is path-based (/th, /en), so the Referer path
        // is the source of truth there; Accept-Language covers Expo and
        // direct API callers.
        detection: ["callback", "header"],
        getLocale: (ctx) => {
          const referer = ctx.request?.headers.get("referer");
          if (!referer) {
            return null;
          }
          try {
            const segment = new URL(referer).pathname.split("/")[1] ?? "";
            return SUPPORTED_LOCALES.has(segment) ? segment : null;
          } catch {
            return null;
          }
        },
        translations,
      }),
      oauthProvider({
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
        consentPage: "/oauth/consent",
        customAccessTokenClaims({ referenceId, scopes }) {
          if (referenceId && scopes.includes("read:organization")) {
            return {
              [`${options.baseUrl}/org`]: referenceId,
            };
          }
          return {};
        },
        loginPage: "/sign-in",
        postLogin: {
          consentReferenceId({ session, scopes }) {
            if (scopes.includes("read:organization")) {
              const activeOrganizationId = (session?.activeOrganizationId ??
                undefined) as string | undefined;
              if (!activeOrganizationId) {
                throw new APIError("BAD_REQUEST", {
                  error: "set_organization",
                  error_description: "must set organization for these scopes",
                });
              }
              return activeOrganizationId;
            }
            return undefined;
          },
          page: "/oauth/select-organization",
          async shouldRedirect({ session, scopes, headers }) {
            const userOnlyScopes = new Set([
              "openid",
              "profile",
              "email",
              "offline_access",
            ]);
            if (scopes.every((sc) => userOnlyScopes.has(sc))) {
              return false;
            }
            // Redirect unless the user's only organization is already active
            try {
              // oxlint-disable-next-line no-use-before-define -- helper is a hoisted function declaration that must close over the later-defined auth instance
              const organizations = (await getAllUserOrganizations(
                headers
              )) as Organization[];
              return (
                organizations.length > 1 ||
                !(
                  organizations.length === 1 &&
                  organizations.at(0)?.id === session.activeOrganizationId
                )
              );
            } catch {
              return true;
            }
          },
        },
        resources: [options.baseUrl],
        scopes: [
          "openid",
          "profile",
          "email",
          "offline_access",
          "read:organization",
        ],
        selectAccount: {
          page: "/oauth/select-account",
          shouldRedirect: async ({ headers }) => {
            // oxlint-disable-next-line no-use-before-define -- helper is a hoisted function declaration that must close over the later-defined auth instance
            const allSessions = await getAllDeviceSessions(headers);
            return allSessions.length >= 1;
          },
        },
      }),
      ...(options.extraPlugins ?? []),
    ],
    secret: options.secret,

    socialProviders: {
      facebook:
        options.facebookClientId && options.facebookClientSecret
          ? {
              clientId: options.facebookClientId,
              clientSecret: options.facebookClientSecret,
            }
          : undefined,
      github:
        options.githubClientId && options.githubClientSecret
          ? {
              clientId: options.githubClientId,
              clientSecret: options.githubClientSecret,
            }
          : undefined,
      google:
        options.googleClientId && options.googleClientSecret
          ? {
              clientId: options.googleClientId,
              clientSecret: options.googleClientSecret,
            }
          : undefined,
      microsoft:
        options.microsoftClientId && options.microsoftClientSecret
          ? {
              clientId: options.microsoftClientId,
              clientSecret: options.microsoftClientSecret,
            }
          : undefined,
      paypal:
        options.paypalClientId && options.paypalClientSecret
          ? {
              clientId: options.paypalClientId,
              clientSecret: options.paypalClientSecret,
            }
          : undefined,
      twitch:
        options.twitchClientId && options.twitchClientSecret
          ? {
              clientId: options.twitchClientId,
              clientSecret: options.twitchClientSecret,
            }
          : undefined,
      twitter:
        options.twitterClientId && options.twitterClientSecret
          ? {
              clientId: options.twitterClientId,
              clientSecret: options.twitterClientSecret,
            }
          : undefined,
      vercel:
        options.vercelClientId && options.vercelClientSecret
          ? {
              clientId: options.vercelClientId,
              clientSecret: options.vercelClientSecret,
            }
          : undefined,
    },
    trustedOrigins: [
      // The Expo app's own deep-link scheme (apps/expo/app.config.ts). Keep
      // these in sync, and keep the scheme app-specific: the expo() plugin
      // already trusts the broad `exp://` scheme in development only, and a
      // generic scheme trusted in production could hand the session cookie to
      // a deep link this app does not control.
      "create-t3-turbo://",
      `https://*.${new URL(options.productionUrl).hostname}`,
      ...(options.trustedOrigins ?? []),
    ],
  } satisfies BetterAuthOptions;

  const auth = betterAuth({
    ...authOptions,
    plugins: [
      ...authOptions.plugins,
      customSession(
        async ({ user, session }) => ({
          session,
          user: {
            ...user,
          },
        }),
        authOptions,
        { shouldMutateListDeviceSessionsEndpoint: true }
      ),
    ],
  });

  // These helpers are referenced from hooks inside authOptions, which makes
  // their types circular with the `auth` instance. The explicit annotations
  // (and the untyped view of `auth.api`) break that inference cycle; the
  // endpoints exist at runtime via the multiSession/organization plugins.
  type UntypedApi = Record<
    "listDeviceSessions" | "listOrganizations",
    (opts: { headers: Headers }) => Promise<unknown[]>
  >;

  async function getAllDeviceSessions(headers: Headers): Promise<unknown[]> {
    return await (auth.api as unknown as UntypedApi).listDeviceSessions({
      headers,
    });
  }

  async function getAllUserOrganizations(headers: Headers): Promise<unknown[]> {
    return await (auth.api as unknown as UntypedApi).listOrganizations({
      headers,
    });
  }

  return auth;
}

export { APIError } from "better-auth";
export type { Organization } from "better-auth/plugins";

export type Auth = ReturnType<typeof initAuth>;
export type AuthApi = Auth["api"];
export type Session = Auth["$Infer"]["Session"];
export type ActiveOrganization = Auth["$Infer"]["ActiveOrganization"];
export type OrganizationRole = ActiveOrganization["members"][number]["role"];
export type Invitation = Auth["$Infer"]["Invitation"];
export type DeviceSession = Awaited<
  ReturnType<Auth["api"]["listDeviceSessions"]>
>[number];

// Extended session data with organization fields (from organization plugin)
export interface OrganizationSession {
  activeOrganizationId: string | null;
  activeTeamId: string | null;
}
