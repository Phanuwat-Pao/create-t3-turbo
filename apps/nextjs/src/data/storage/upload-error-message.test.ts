import { createInstance } from "i18next";

import en from "~/i18n/en.json";
import th from "~/i18n/th.json";

import { uploadErrorMessage } from "./upload-error-message";
import { StorageUploadError } from "./upload-file";

// upload-file imports the oRPC client, which validates server env on load.
vi.mock("./storage-mutations", () => ({}));

const i18n = createInstance();
await i18n.init({
  lng: "th",
  resources: { en: { translation: en }, th: { translation: th } },
});

describe("uploadErrorMessage", () => {
  it.each([
    ["ABORTED", th.upload.aborted],
    ["COMPLETE_FAILED", th.upload.completeFailed],
    ["SIGNING_FAILED", th.upload.signingFailed],
    ["UPLOAD_FAILED", th.upload.uploadFailed],
  ] as const)("translates %s", (code, message) => {
    const error = new StorageUploadError(code, "English detail for logs");
    expect(uploadErrorMessage(error, i18n.t)).toBe(message);
  });

  it("falls back to a generic upload error", () => {
    expect(uploadErrorMessage(new Error("boom"), i18n.t)).toBe(
      th.upload.failed
    );
    expect(uploadErrorMessage("boom", i18n.getFixedT("en"))).toBe(
      en.upload.failed
    );
  });
});
