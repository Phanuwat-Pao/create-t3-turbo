import { render } from "@react-email/components";

import { reactInvitationEmail } from "./invitation";
import { reactMagicLinkEmail } from "./magic-link";
import { transporter } from "./nodemailer";
import { reactResetPasswordEmail } from "./reset-password";
import VerifyEmail from "./verify-email";
import { reactVerifyOTP } from "./verify-otp";

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, string>;
}

export async function sendEmail({
  to,
  subject,
  template,
  variables,
}: SendEmailOptions): Promise<void> {
  let html: string;

  switch (template) {
    case "reset-password": {
      html = await render(
        reactResetPasswordEmail({
          url: variables.resetLink,
          username: variables.userName,
        })
      );
      break;
    }

    case "verify-email": {
      html = await render(
        VerifyEmail({
          url: variables.verificationUrl ?? "",
        })
      );
      break;
    }

    case "invitation": {
      html = await render(
        reactInvitationEmail({
          inviteLink: variables.inviteLink,
          invitedByEmail: variables.inviterEmail,
          invitedByUsername: variables.inviterName,
          teamName: variables.organizationName,
        })
      );
      break;
    }

    case "two-factor": {
      html = await render(
        reactVerifyOTP({
          code: variables.otpCode ?? "",
        })
      );
      break;
    }

    case "magic-link": {
      html = await render(
        reactMagicLinkEmail({
          url: variables.url ?? "",
        })
      );
      break;
    }

    default: {
      throw new Error(`Unknown email template: ${template}`);
    }
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
    html,
    subject,
    to,
  });
}
