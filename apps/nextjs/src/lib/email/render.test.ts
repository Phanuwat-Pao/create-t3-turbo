import en from "~/i18n/en.json";
import type { Locale } from "~/i18n/i18n-config";
import th from "~/i18n/th.json";

import { renderEmail } from "./render";

const copy = { en: en.email, th: th.email } as const;

const RESET_LINK =
  "https://app.example/api/auth/reset-password/reset-token-123?callbackURL=%2Fth%2Freset-password";
const VERIFY_LINK =
  "https://app.example/api/auth/verify-email?token=verify-token-456";
const INVITE_LINK = "https://app.example/accept-invitation/invite-789";
const MAGIC_LINK = "https://app.example/api/auth/magic-link/verify?token=m1";

const LOCALES: Locale[] = ["en", "th"];

function other(locale: Locale): Locale {
  return locale === "en" ? "th" : "en";
}

describe.each(LOCALES)("renderEmail in %s", (locale) => {
  const text = copy[locale];
  const otherText = copy[other(locale)];
  // react-email's Body defaults to lang="en" for itself and its inner cell.
  const otherLang = `lang="${other(locale)}"`;

  it("renders the password reset email", async () => {
    const { html, subject } = await renderEmail({
      locale,
      template: "reset-password",
      to: "somchai@example.com",
      variables: {
        resetLink: RESET_LINK,
        userEmail: "somchai@example.com",
        userName: "Somchai",
      },
    });
    expect(subject).toBe(text.resetPassword.subject);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).not.toContain(otherLang);
    expect(html).toContain(text.resetPassword.button);
    expect(html).toContain(
      text.resetPassword.greeting.replace("{{name}}", "Somchai")
    );
    expect(html).toContain(`href="${RESET_LINK}"`);
    expect(html).not.toContain(otherText.resetPassword.button);
  });

  it("renders the verification email", async () => {
    const { html, subject } = await renderEmail({
      locale,
      template: "verify-email",
      to: "somchai@example.com",
      variables: { verificationUrl: VERIFY_LINK },
    });
    expect(subject).toBe(text.verifyEmail.subject);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).not.toContain(otherLang);
    expect(html).toContain(text.verifyEmail.link);
    expect(html).toContain(`href="${VERIFY_LINK}"`);
    expect(html).toContain(text.footer.replace("{{brand}}", "Better Auth"));
    expect(html).not.toContain(otherText.verifyEmail.link);
  });

  it("renders the organization invitation", async () => {
    const { html, subject } = await renderEmail({
      locale,
      template: "invitation",
      to: "invitee@example.com",
      variables: {
        inviteLink: INVITE_LINK,
        inviterEmail: "nok@example.com",
        inviterName: "Nok",
        organizationName: "Acme Thai",
        role: "member",
      },
    });
    expect(subject).toBe(text.invitation.subject);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).not.toContain(otherLang);
    expect(html).toContain(text.invitation.button);
    expect(html).toContain(`href="${INVITE_LINK}"`);
    expect(html).toContain('href="mailto:nok@example.com"');
    expect(html).toContain("<strong>Nok</strong>");
    expect(html).toContain("<strong>Acme Thai</strong>");
    // The footer names the recipient, which used to render empty.
    expect(html).toContain("invitee@example.com");
    expect(html).not.toContain(otherText.invitation.button);
  });

  it("renders the two-factor code", async () => {
    const { html, subject } = await renderEmail({
      locale,
      template: "two-factor",
      to: "somchai@example.com",
      variables: { appName: "Better Auth App", otpCode: "482913" },
    });
    expect(subject).toBe(text.twoFactor.subject);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).not.toContain(otherLang);
    expect(html).toContain(text.twoFactor.heading);
    expect(html).toContain("482913");
    expect(html).not.toContain(otherText.twoFactor.heading);
  });

  it("renders the magic link email", async () => {
    const { html, subject } = await renderEmail({
      locale,
      template: "magic-link",
      to: "somchai@example.com",
      variables: { url: MAGIC_LINK },
    });
    expect(subject).toBe(text.magicLink.subject);
    expect(html).toContain(text.magicLink.link);
    expect(html).toContain(`href="${MAGIC_LINK}"`);
  });
});

describe("renderEmail", () => {
  it("writes Thai for th and English for en", async () => {
    const variables = { otpCode: "111222" };
    const thai = await renderEmail({
      locale: "th",
      template: "two-factor",
      to: "a@example.com",
      variables,
    });
    const english = await renderEmail({
      locale: "en",
      template: "two-factor",
      to: "a@example.com",
      variables,
    });
    expect(thai.html).toContain("การยืนยันตัวตนสองขั้นตอน");
    expect(english.html).toContain("Two-factor authentication");
  });

  it("escapes names inside translated markup", async () => {
    const { html } = await renderEmail({
      locale: "th",
      template: "invitation",
      to: "invitee@example.com",
      variables: {
        inviteLink: INVITE_LINK,
        inviterEmail: "eve@example.com",
        inviterName: '<img src="x"> Eve & Co',
        organizationName: "<script>alert(1)</script>",
      },
    });
    expect(html).not.toContain('<img src="x">');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;img");
    expect(html).toContain("Eve &amp; Co");
  });

  it("rejects an unknown template", async () => {
    await expect(
      renderEmail({
        locale: "en",
        template: "nope",
        to: "a@b.c",
        variables: {},
      })
    ).rejects.toThrow("Unknown email template: nope");
  });
});
