import { createS3Service } from "@acme/api";

import { env } from "~/env";

export const s3 = createS3Service({
  config: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    bucket: env.S3_BUCKET,
    downloadUrlExpiresIn: env.S3_DOWNLOAD_URL_EXPIRES_IN,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    region: env.S3_REGION,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    uploadUrlExpiresIn: env.S3_UPLOAD_URL_EXPIRES_IN,
  },
});
