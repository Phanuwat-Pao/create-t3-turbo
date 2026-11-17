import type { TFunction } from "i18next";

import { StorageUploadError, type StorageUploadErrorCode } from "./upload-file";

const MESSAGE_KEYS = {
  ABORTED: "upload.aborted",
  COMPLETE_FAILED: "upload.completeFailed",
  SIGNING_FAILED: "upload.signingFailed",
  UPLOAD_FAILED: "upload.uploadFailed",
} as const satisfies Record<StorageUploadErrorCode, string>;

/**
 * The message to show for an `uploadFile` failure, in the page's language.
 * `StorageUploadError` messages are English and meant for logs; this maps the
 * error's `code` instead, and anything else gets a generic upload error.
 */
export function uploadErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof StorageUploadError) {
    return t(MESSAGE_KEYS[error.code]);
  }
  return t("upload.failed");
}
