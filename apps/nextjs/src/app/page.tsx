import { headers } from "next/headers";

import EntryButton from "~/components/entry-button";
import { auth } from "~/lib/auth";

const features: { name: string; link: string }[] = [
  {
    link: "https://www.better-auth.com/docs/authentication/email-password",
    name: "Email & Password",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/organization",
    name: "Organization | Teams",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/passkey",
    name: "Passkeys",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/2fa",
    name: "Multi Factor",
  },
  {
    link: "https://www.better-auth.com/docs/authentication/email-password#request-password-reset",
    name: "Password Reset",
  },
  {
    link: "https://www.better-auth.com/docs/authentication/email-password#email-verification",
    name: "Email Verification",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/organization#roles",
    name: "Roles & Permissions",
  },
  {
    link: "https://www.better-auth.com/docs/reference/security#rate-limiting",
    name: "Rate Limiting",
  },
  {
    link: "https://www.better-auth.com/docs/concepts/session-management",
    name: "Session Management",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/multi-session",
    name: "Multiple Session",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/stripe",
    name: "Stripe Integration",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/last-login-method",
    name: "Last Login Method",
  },
  {
    link: "https://www.better-auth.com/docs/plugins/oauth-provider",
    name: "OAuth Provider",
  },
];

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            BETTER-AUTH.
          </h1>
          <p className="text-center text-sm wrap-break-word md:text-base">
            Official demo to showcase{" "}
            <a
              href="https://better-auth.com"
              target="_blank"
              className="italic underline"
              rel="noopener"
            >
              better-auth.
            </a>{" "}
            features and capabilities. <br />
          </p>
        </div>
        <div className="flex w-full max-w-xl flex-col gap-4">
          <div className="flex flex-col flex-wrap gap-3 pt-2">
            <div className="bg-secondary/70 border border-dashed p-2">
              <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                <span className="text-center">
                  All features on this demo are implemented with Better Auth
                  without any custom backend code
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {features.map((feature) => (
                <a
                  className="text-muted-foreground hover:text-foreground hover:border-foreground flex cursor-pointer items-center gap-1 border-b pb-1 text-xs transition-all duration-150 ease-in-out"
                  key={feature.name}
                  href={feature.link}
                  rel="noopener"
                >
                  {feature.name}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <EntryButton session={session} />
          </div>
        </div>
      </div>
    </main>
  );
}
