import { db } from "@acme/db/client";
import { expo } from "@better-auth/expo";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
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
} from "better-auth/plugins";

export interface InitAuthOptions<
  TExtraPlugins extends BetterAuthPlugin[] = [],
> {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  discordClientId?: string;
  discordClientSecret?: string;
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
          "discord",
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
      admin(),
      multiSession(),
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      oneTap(),
      deviceAuthorization({
        expiresIn: "3min",
        interval: "5s",
      }),
      lastLoginMethod(),
      jwt({
        jwt: {
          issuer: options.productionUrl,
        },
      }),
      expo(),
      passkey(),
      oauthProvider({
        consentPage: "/oauth/consent",
        loginPage: "/sign-in",
      }),
      customSession(async (session) => ({
        ...session,
        user: {
          ...session.user,
        },
      })),
      ...(options.extraPlugins ?? []),
    ],
    secret: options.secret,
    socialProviders: {
      discord:
        options.discordClientId && options.discordClientSecret
          ? {
              clientId: options.discordClientId,
              clientSecret: options.discordClientSecret,
              redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
            }
          : undefined,
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
      "expo://",
      `https://*.${new URL(options.productionUrl).hostname}`,
    ],
  } satisfies BetterAuthOptions;

  const auth = betterAuth(authOptions);

  return auth;
}

export { APIError };
export type { Organization };

export type Auth = ReturnType<typeof initAuth>;
export type AuthApi = Auth["api"];
export type Session = Auth["$Infer"]["Session"];
