/* eslint-disable jest/no-hooks, jest/require-hook, promise/prefer-await-to-callbacks */
import { ORPCError, call } from "@orpc/server";

import type { Context } from "../orpc";
import type { S3Service } from "../s3";
import storageRouter from "./storage";

function createS3Mock(): {
  service: S3Service;
  spies: Record<keyof S3Service, ReturnType<typeof vi.fn>>;
} {
  const spies = {
    abortMultipartUpload: vi.fn(),
    completeMultipartUpload: vi.fn(),
    createMultipartUpload: vi.fn(),
    createUploadUrl: vi.fn(),
    getDownloadUrl: vi.fn(),
    signMultipartPart: vi.fn(),
  };

  return {
    service: {
      abortMultipartUpload: spies.abortMultipartUpload,
      completeMultipartUpload: spies.completeMultipartUpload,
      createMultipartUpload: spies.createMultipartUpload,
      createUploadUrl: spies.createUploadUrl,
      getDownloadUrl: spies.getDownloadUrl,
      signMultipartPart: spies.signMultipartPart,
    },
    spies,
  };
}

function createContext(options: { s3: S3Service; userId?: string }): Context {
  return {
    authApi: {} as Context["authApi"],
    db: {
      transaction: async (callback: (tx: Context["db"]) => Promise<unknown>) =>
        callback({} as Context["db"]),
    } as Context["db"],
    s3: options.s3,
    session: options.userId
      ? ({ user: { id: options.userId } } as NonNullable<Context["session"]>)
      : null,
  };
}

describe("storage router", () => {
  let harness: ReturnType<typeof createS3Mock>;

  beforeEach(() => {
    harness = createS3Mock();
  });

  it("rejects unauthenticated callers before invoking storage services", async () => {
    await expect(
      call(
        storageRouter.createUploadUrl,
        {
          contentType: "image/png",
          filename: "avatar.png",
        },
        {
          context: createContext({
            s3: harness.service,
          }),
        }
      )
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });

    expect(harness.spies.createUploadUrl).not.toHaveBeenCalled();
  });

  it("passes the authenticated user id into createUploadUrl", async () => {
    harness.spies.createUploadUrl.mockResolvedValue({
      expiresIn: 123,
      key: "users/user_123/uploads/2026/03/avatar.png",
      method: "PUT",
      url: "https://signed.example.com/upload",
    });

    const result = await call(
      storageRouter.createUploadUrl,
      {
        contentType: "image/png",
        filename: "avatar.png",
      },
      {
        context: createContext({
          s3: harness.service,
          userId: "user_123",
        }),
      }
    );

    expect(result).toStrictEqual({
      expiresIn: 123,
      key: "users/user_123/uploads/2026/03/avatar.png",
      method: "PUT",
      url: "https://signed.example.com/upload",
    });
    expect(harness.spies.createUploadUrl).toHaveBeenCalledWith({
      contentType: "image/png",
      filename: "avatar.png",
      userId: "user_123",
    });
  });

  it("delegates multipart completion with the authenticated user id", async () => {
    harness.spies.completeMultipartUpload.mockResolvedValue({
      key: "users/user_123/uploads/2026/03/file.bin",
    });

    const input = {
      key: "users/user_123/uploads/2026/03/file.bin",
      parts: [
        { etag: "etag-1", partNumber: 1 },
        { etag: "etag-2", partNumber: 2 },
      ],
      uploadId: "upload-123",
    };

    await call(storageRouter.completeMultipartUpload, input, {
      context: createContext({
        s3: harness.service,
        userId: "user_123",
      }),
    });

    expect(harness.spies.completeMultipartUpload).toHaveBeenCalledWith({
      ...input,
      userId: "user_123",
    });
  });

  it("returns forbidden errors from download signing unchanged", async () => {
    harness.spies.getDownloadUrl.mockRejectedValue(
      new ORPCError("FORBIDDEN", {
        message: "Storage key is outside the authenticated user scope",
      })
    );

    await expect(
      call(
        storageRouter.getDownloadUrl,
        {
          key: "users/other/uploads/2026/03/file.png",
        },
        {
          context: createContext({
            s3: harness.service,
            userId: "user_123",
          }),
        }
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    expect(harness.spies.getDownloadUrl).toHaveBeenCalledWith({
      key: "users/other/uploads/2026/03/file.png",
      userId: "user_123",
    });
  });
});
