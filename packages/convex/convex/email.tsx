import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/components";

import type { ActionCtx } from "./_generated/server";
import { components } from "./_generated/api";
import { reactInvitationEmail } from "./emails/invitation";
import MagicLinkEmail from "./emails/magicLink";
import { reactResetPasswordEmail } from "./emails/resetPassword";
import VerifyEmail from "./emails/verifyEmail";
import VerifyOTP from "./emails/verifyOTP";

import "./polyfills";

export const resend = new Resend(components.resend, {
  testMode: false,
});

export const sendVerificationEmail = async (
  ctx: ActionCtx,
  {
    from,
    to,
    url,
  }: {
    from: string;
    to: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from,
    to,
    subject: "Verify your email address",
    html: await render(<VerifyEmail url={url} />),
  });
};

export const sendOTPVerification = async (
  ctx: ActionCtx,
  {
    from,
    to,
    code,
  }: {
    from: string;
    to: string;
    code: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from,
    to,
    subject: "Verify your email address",
    html: await render(<VerifyOTP code={code} />),
  });
};

export const sendMagicLink = async (
  ctx: ActionCtx,
  {
    from,
    to,
    url,
  }: {
    from: string;
    to: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from,
    to,
    subject: "Sign in to your account",
    html: await render(<MagicLinkEmail url={url} />),
  });
};

export const sendResetPassword = async (
  ctx: ActionCtx,
  {
    from,
    to,
    username,
    url,
  }: {
    from: string;
    to: string;
    username: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from,
    to,
    subject: "Reset your password",
    html: await render(
      reactResetPasswordEmail({
        username,
        url,
      }),
    ),
  });
};

export const sendInvitationEmail = async (
  ctx: ActionCtx,
  {
    from,
    to,
    username,
    invitedByUsername,
    invitedByEmail,
    teamName,
    inviteLink,
    teamImage,
  }: {
    from: string;
    to: string;
    username: string;
    invitedByUsername: string;
    invitedByEmail: string;
    teamName: string;
    teamImage?: string;
    inviteLink: string;
  },
) => {
  await resend.sendEmail(requireActionCtx(ctx), {
    from,
    to,
    subject: "You've been invited to join an organization",
    html: await render(
      reactInvitationEmail({
        username,
        invitedByUsername,
        invitedByEmail,
        teamName,
        teamImage,
        inviteLink,
      }),
    ),
  });
};

export const sendOtp = async (
  ctx: ActionCtx,
  {
    from,
    to,
    otp,
  }: {
    from: string;
    to: string;
    otp: string;
  },
) => {
  await resend.sendEmail(requireActionCtx(ctx), {
    from,
    to,
    subject: "Your OTP",
    html: `Your OTP is ${otp}`,
  });
};
