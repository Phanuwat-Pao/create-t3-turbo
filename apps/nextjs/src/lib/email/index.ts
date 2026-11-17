import { transporter } from "./nodemailer";
import { type RenderEmailOptions, renderEmail } from "./render";

/**
 * Sends an auth email in the language of the request that triggered it.
 * initAuth passes the template name, recipient, variables and locale.
 */
export async function sendEmail(options: RenderEmailOptions): Promise<void> {
  const { html, subject } = await renderEmail(options);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
    html,
    subject,
    to: options.to,
  });
}
