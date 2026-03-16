/* eslint-disable jest/no-hooks, jest/require-hook */
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";

import { createS3Service } from "./s3";

const fixedDate = new Date("2026-03-16T12:34:56.000Z");
const storageConfig = {
  accessKeyId: "test-access-key",
  bucket: "test-bucket",
  downloadUrlExpiresIn: 321,
  region: "us-east-1",
  secretAccessKey: "test-secret-key",
  uploadUrlExpiresIn: 123,
} as const;

function getFirstCall<TArgs>(calls: TArgs[]): TArgs {
  const firstCall = calls.at(0);

  if (!firstCall) {
    throw new Error("expected a mock call");
  }

  return firstCall;
}

function createHarness(options?: { randomId?: () => string }) {
  const send = vi.fn();
  const presign = vi
    .fn()
    .mockResolvedValue("https://signed.example.com/upload");

  const service = createS3Service(
    {
      config: storageConfig,
    },
    {
      client: { send },
      now: () => fixedDate,
      presign,
      ...(options?.randomId ? { randomId: options.randomId } : {}),
    }
  );

  return {
    presign,
    send,
    service,
  };
}

describe("s3 storage service", () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    harness = createHarness({
      randomId: () => "abc123",
    });
  });

  it("creates a single upload URL inside the authenticated user prefix", async () => {
    const result = await harness.service.createUploadUrl({
      contentType: "image/png",
      filename: "Avatar Profile.png",
      userId: "user_123",
    });

    expect(result).toStrictEqual({
      expiresIn: 123,
      key: "users/user_123/uploads/2026/03/abc123-Avatar-Profile.png",
      method: "PUT",
      url: "https://signed.example.com/upload",
    });

    const [command, expiresIn] = getFirstCall(harness.presign.mock.calls);
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect((command as PutObjectCommand).input).toMatchObject({
      Bucket: "test-bucket",
      ContentType: "image/png",
      Key: "users/user_123/uploads/2026/03/abc123-Avatar-Profile.png",
    });
    expect(expiresIn).toBe(123);
  });

  it("uses nanoid for storage keys when no randomId dependency is injected", async () => {
    const defaultHarness = createHarness();

    const result = await defaultHarness.service.createUploadUrl({
      contentType: "image/png",
      filename: "avatar.png",
      userId: "user_123",
    });

    const keyId = result.key
      .replace("users/user_123/uploads/2026/03/", "")
      .replace("-avatar.png", "");

    expect(keyId).toHaveLength(21);
    expect(keyId).not.toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("creates multipart uploads inside the authenticated user prefix", async () => {
    harness.send.mockResolvedValueOnce({ UploadId: "upload-123" });

    const result = await harness.service.createMultipartUpload({
      contentType: "application/pdf",
      filename: "contract.pdf",
      userId: "user_123",
    });

    expect(result).toStrictEqual({
      key: "users/user_123/uploads/2026/03/abc123-contract.pdf",
      uploadId: "upload-123",
    });

    const [command] = getFirstCall(harness.send.mock.calls);
    expect(command).toBeInstanceOf(CreateMultipartUploadCommand);
    expect((command as CreateMultipartUploadCommand).input).toMatchObject({
      Bucket: "test-bucket",
      ContentType: "application/pdf",
      Key: "users/user_123/uploads/2026/03/abc123-contract.pdf",
    });
  });

  it("rejects signing multipart parts outside the caller prefix", async () => {
    await expect(
      harness.service.signMultipartPart({
        key: "users/other/uploads/2026/03/file.bin",
        partNumber: 1,
        uploadId: "upload-123",
        userId: "user_123",
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("completes multipart uploads with the ordered parts list", async () => {
    harness.send.mockResolvedValueOnce({});

    await harness.service.completeMultipartUpload({
      key: "users/user_123/uploads/2026/03/file.bin",
      parts: [
        { etag: "etag-1", partNumber: 1 },
        { etag: "etag-2", partNumber: 2 },
      ],
      uploadId: "upload-123",
      userId: "user_123",
    });

    const [command] = getFirstCall(harness.send.mock.calls);
    expect(command).toBeInstanceOf(CompleteMultipartUploadCommand);
    expect((command as CompleteMultipartUploadCommand).input).toMatchObject({
      Bucket: "test-bucket",
      Key: "users/user_123/uploads/2026/03/file.bin",
      MultipartUpload: {
        Parts: [
          { ETag: "etag-1", PartNumber: 1 },
          { ETag: "etag-2", PartNumber: 2 },
        ],
      },
      UploadId: "upload-123",
    });
  });

  it("aborts multipart uploads inside the caller prefix", async () => {
    harness.send.mockResolvedValueOnce({});

    await harness.service.abortMultipartUpload({
      key: "users/user_123/uploads/2026/03/file.bin",
      uploadId: "upload-123",
      userId: "user_123",
    });

    const [command] = getFirstCall(harness.send.mock.calls);
    expect(command).toBeInstanceOf(AbortMultipartUploadCommand);
    expect((command as AbortMultipartUploadCommand).input).toMatchObject({
      Bucket: "test-bucket",
      Key: "users/user_123/uploads/2026/03/file.bin",
      UploadId: "upload-123",
    });
  });

  it("creates download URLs only for keys inside the caller prefix", async () => {
    await expect(
      harness.service.getDownloadUrl({
        key: "users/other/uploads/2026/03/file.png",
        userId: "user_123",
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    const result = await harness.service.getDownloadUrl({
      filename: "download.png",
      key: "users/user_123/uploads/2026/03/file.png",
      userId: "user_123",
    });

    expect(result).toStrictEqual({
      expiresIn: 321,
      method: "GET",
      url: "https://signed.example.com/upload",
    });
    expect(harness.presign.mock.calls).toMatchObject([
      [expect.any(GetObjectCommand), 321],
    ]);

    const [command] = getFirstCall(harness.presign.mock.calls);
    expect((command as GetObjectCommand).input).toMatchObject({
      Bucket: "test-bucket",
      Key: "users/user_123/uploads/2026/03/file.png",
      ResponseContentDisposition: 'attachment; filename="download.png"',
    });
  });

  it("signs multipart upload parts for keys inside the caller prefix", async () => {
    const result = await harness.service.signMultipartPart({
      key: "users/user_123/uploads/2026/03/file.bin",
      partNumber: 3,
      uploadId: "upload-123",
      userId: "user_123",
    });

    expect(result).toStrictEqual({
      expiresIn: 123,
      partNumber: 3,
      url: "https://signed.example.com/upload",
    });

    const [command] = getFirstCall(harness.presign.mock.calls);
    expect(command).toBeInstanceOf(UploadPartCommand);
    expect((command as UploadPartCommand).input).toMatchObject({
      Bucket: "test-bucket",
      Key: "users/user_123/uploads/2026/03/file.bin",
      PartNumber: 3,
      UploadId: "upload-123",
    });
  });
});
