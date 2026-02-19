import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "~/auth/server";
import EntryButton from "~/components/entry-button";
import { getDictionary } from "~/i18n/get-dictionary";
import { i18n } from "~/i18n/i18n-config";

const features = [
  {
    key: "emailPassword",
    link: "https://www.better-auth.com/docs/authentication/email-password",
  },
  {
    key: "organization",
    link: "https://www.better-auth.com/docs/plugins/organization",
  },
  {
    key: "passkeys",
    link: "https://www.better-auth.com/docs/plugins/passkey",
  },
  {
    key: "multiFactor",
    link: "https://www.better-auth.com/docs/plugins/2fa",
  },
  {
    key: "passwordReset",
    link: "https://www.better-auth.com/docs/authentication/email-password#request-password-reset",
  },
  {
    key: "emailVerification",
    link: "https://www.better-auth.com/docs/authentication/email-password#email-verification",
  },
  {
    key: "rolesPermissions",
    link: "https://www.better-auth.com/docs/plugins/organization#roles",
  },
  {
    key: "rateLimiting",
    link: "https://www.better-auth.com/docs/reference/security#rate-limiting",
  },
  {
    key: "sessionManagement",
    link: "https://www.better-auth.com/docs/concepts/session-management",
  },
  {
    key: "multipleSessions",
    link: "https://www.better-auth.com/docs/plugins/multi-session",
  },
  {
    key: "stripeIntegration",
    link: "https://www.better-auth.com/docs/plugins/stripe",
  },
  {
    key: "lastLoginMethod",
    link: "https://www.better-auth.com/docs/plugins/last-login-method",
  },
  {
    key: "oauthProvider",
    link: "https://www.better-auth.com/docs/plugins/oauth-provider",
  },
] as const;

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const dict = await getDictionary(i18n.defaultLocale);

  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            {dict.landing.title}
          </h1>
          <p className="text-center text-sm wrap-break-word md:text-base">
            {dict.landing.description}{" "}
            <a
              href="https://better-auth.com"
              target="_blank"
              className="italic underline"
              rel="noreferrer"
            >
              {dict.landing.linkText}
            </a>{" "}
            features and capabilities. <br />
          </p>
        </div>
        <div className="flex w-full max-w-xl flex-col gap-4">
          <div className="flex flex-col flex-wrap gap-3 pt-2">
            <div className="bg-secondary/70 border border-dashed p-2">
              <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                <span className="text-center">{dict.landing.infoBox}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {features.map((feature) => (
                <Link
                  className="text-muted-foreground hover:text-foreground hover:border-foreground flex cursor-pointer items-center gap-1 border-b pb-1 text-xs transition-all duration-150 ease-in-out"
                  key={feature.key}
                  href={feature.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {dict.landing.features[feature.key]}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <EntryButton session={session} dict={dict} />
          </div>
        </div>
      </div>
    </main>
  );
}
