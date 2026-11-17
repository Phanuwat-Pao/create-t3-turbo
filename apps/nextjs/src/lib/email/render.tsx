import { render } from "react-email";

import type { Locale } from "~/i18n/i18n-config";

import { getEmailT } from "./i18n";
import { InviteUserEmail } from "./invitation";
import MagicLinkEmail from "./magic-link";
import { ResetPasswordEmail } from "./reset-password";
import VerifyEmail from "./verify-email";
import VerifyOTP from "./verify-otp";

export interface RenderEmailOptions {
  /** The language of the request that triggered the email. */
  locale: Locale;
  template: string;
  to: string;
  variables: Record<string, string>;
}

export interface RenderedEmail {
  html: string;
  subject: string;
}

/**
 * Subject and HTML body for an auth email, written in `locale`. The template
 * name picks both, so packages/auth never needs the app's copy.
 */
export async function renderEmail({
  locale,
  template,
  to,
  variables,
}: RenderEmailOptions): Promise<RenderedEmail> {
  const t = getEmailT(locale);

  switch (template) {
    case "reset-password": {
      return {
        html: await render(
          <ResetPasswordEmail
            locale={locale}
            t={t}
            url={variables.resetLink}
            username={variables.userName}
          />
        ),
        subject: t("email.resetPassword.subject"),
      };
    }

    case "verify-email": {
      return {
        html: await render(
          <VerifyEmail
            locale={locale}
            t={t}
            url={variables.verificationUrl ?? ""}
          />
        ),
        subject: t("email.verifyEmail.subject"),
      };
    }

    case "invitation": {
      return {
        html: await render(
          <InviteUserEmail
            inviteLink={variables.inviteLink}
            invitedByEmail={variables.inviterEmail}
            invitedByUsername={variables.inviterName}
            locale={locale}
            t={t}
            teamName={variables.organizationName}
            username={to}
          />
        ),
        subject: t("email.invitation.subject"),
      };
    }

    case "two-factor": {
      return {
        html: await render(
          <VerifyOTP code={variables.otpCode ?? ""} locale={locale} t={t} />
        ),
        subject: t("email.twoFactor.subject"),
      };
    }

    case "magic-link": {
      return {
        html: await render(
          <MagicLinkEmail locale={locale} t={t} url={variables.url ?? ""} />
        ),
        subject: t("email.magicLink.subject"),
      };
    }

    default: {
      throw new Error(`Unknown email template: ${template}`);
    }
  }
}
