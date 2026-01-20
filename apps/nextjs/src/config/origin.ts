import { env } from "~/env";

const origins = [...env.TRUSTED_ORIGINS, "https://appleid.apple.com"];

if (env.VERCEL_PROJECT_PRODUCTION_URL) {
  origins.push(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
}
if (env.VERCEL_URL) {
  origins.push(`https://${env.VERCEL_URL}`);
}

export default origins;
