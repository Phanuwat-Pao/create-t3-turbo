import { db } from "@acme/db/client";
import { expo } from "@better-auth/expo";
import {
  type BetterAuthOptions,
  type BetterAuthPlugin,
  betterAuth,
} from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy, openAPI } from "better-auth/plugins";

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  discordClientId?: string;
  discordClientSecret?: string;
  extraPlugins?: TExtraPlugins;
}) {
  const config = {
    baseURL: options.baseUrl,
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      expo(),
      ...(options.extraPlugins ?? []),

      openAPI({
        disableDefaultReference: true,
      }),
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
    },
    trustedOrigins: ["expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type AuthApi = Auth["api"];
export type Session = Auth["$Infer"]["Session"];
