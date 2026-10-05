import { createTransport } from "nodemailer";

import { env } from "~/env";

export const transporter = createTransport({
  auth: {
    pass: env.EMAIL_PASS,
    user: env.EMAIL_USER,
  },
  service: "gmail",
});
