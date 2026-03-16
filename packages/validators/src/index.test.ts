

import {
  CompleteMultipartUploadRequestSchema,
  DownloadUrlRequestSchema,
  MultipartUploadRequestSchema,
  SignMultipartPartRequestSchema,
  SingleUploadRequestSchema,
  buildUserStoragePrefix,
  isUserScopedKey,
  sanitizeFilename,
} from "./index";

describe("storage validators", () => {
  it("buildUserStoragePrefix scopes keys to the authenticated user", () => {
    expect(buildUserStoragePrefix("user_123")).toBe("users/user_123/");
  });

  it("isUserScopedKey accepts only keys inside the user prefix", () => {
    expect(
      isUserScopedKey("users/user_123/uploads/2026/03/file.png", "user_123")
    ).toBeTruthy();
    expect(
      isUserScopedKey("users/other/uploads/2026/03/file.png", "user_123")
    ).toBeFalsy();
    expect(
      isUserScopedKey("../users/user_123/file.png", "user_123")
    ).toBeFalsy();
  });

  it("sanitizeFilename removes unsafe path segments", () => {
    expect(sanitizeFilename("../../avatar profile.png")).toBe(
      "avatar-profile.png"
    );
    expect(sanitizeFilename("")).toBe("file");
  });

  it("singleUploadRequestSchema accepts a valid upload payload", () => {
    const result = SingleUploadRequestSchema.safeParse({
      contentType: "image/png",
      filename: "avatar.png",
      size: 2048,
    });

    expect(result.success).toBeTruthy();
  });

  it("multipartUploadRequestSchema accepts the same metadata as single upload", () => {
    const result = MultipartUploadRequestSchema.safeParse({
      contentType: "application/pdf",
      filename: "contract.pdf",
    });

    expect(result.success).toBeTruthy();
  });

  it("signMultipartPartRequestSchema rejects invalid part numbers", () => {
    const result = SignMultipartPartRequestSchema.safeParse({
      key: "users/user_123/uploads/2026/03/file.bin",
      partNumber: 0,
      uploadId: "upload-123",
    });

    expect(result.success).toBeFalsy();
  });

  it("completeMultipartUploadRequestSchema rejects duplicate or unsorted parts", () => {
    const result = CompleteMultipartUploadRequestSchema.safeParse({
      key: "users/user_123/uploads/2026/03/file.bin",
      parts: [
        { etag: "etag-2", partNumber: 2 },
        { etag: "etag-1", partNumber: 1 },
        { etag: "etag-1b", partNumber: 1 },
      ],
      uploadId: "upload-123",
    });

    expect(result.success).toBeFalsy();
  });

  it("downloadUrlRequestSchema accepts a user-scoped key", () => {
    const result = DownloadUrlRequestSchema.safeParse({
      filename: "download.png",
      key: "users/user_123/uploads/2026/03/file.png",
    });

    expect(result.success).toBeTruthy();
  });
});
