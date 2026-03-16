import { randomUUID } from "node:crypto";

import type {
  CompleteMultipartUploadRequest,
  DownloadUrlRequest,
  MultipartUploadRequest,
  SignMultipartPartRequest,
  SingleUploadRequest,
} from "@acme/validators";
import {
  buildUserStoragePrefix,
  isUserScopedKey,
  sanitizeFilename,
} from "@acme/validators";
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ORPCError } from "@orpc/server";

const DEFAULT_DOWNLOAD_URL_EXPIRES_IN = 900;
const DEFAULT_UPLOAD_URL_EXPIRES_IN = 900;

export interface S3ServiceConfigInput {
  accessKeyId?: string;
  bucket?: string;
  downloadUrlExpiresIn?: number;
  endpoint?: string;
  forcePathStyle?: boolean;
  region?: string;
  secretAccessKey?: string;
  uploadUrlExpiresIn?: number;
}

interface S3ServiceConfig {
  accessKeyId: string;
  bucket: string;
  downloadUrlExpiresIn: number;
  endpoint?: string;
  forcePathStyle: boolean;
  region: string;
  secretAccessKey: string;
  uploadUrlExpiresIn: number;
}

interface S3ClientLike {
  send(command: object): Promise<any>;
}

interface CreateS3ServiceDependencies {
  client?: S3ClientLike;
  now?: () => Date;
  presign?: (command: object, expiresIn: number) => Promise<string>;
  randomId?: () => string;
}

type UploadInput = SingleUploadRequest & {
  userId: string;
};

type MultipartInput = MultipartUploadRequest & {
  userId: string;
};

type MultipartPartInput = SignMultipartPartRequest & {
  userId: string;
};

type CompleteMultipartInput = CompleteMultipartUploadRequest & {
  userId: string;
};

interface AbortMultipartInput {
  key: string;
  uploadId: string;
  userId: string;
}

type DownloadInput = DownloadUrlRequest & {
  userId: string;
};

export interface S3Service {
  abortMultipartUpload(input: AbortMultipartInput): Promise<{
    aborted: true;
    key: string;
  }>;
  completeMultipartUpload(input: CompleteMultipartInput): Promise<{
    key: string;
  }>;
  createMultipartUpload(input: MultipartInput): Promise<{
    key: string;
    uploadId: string;
  }>;
  createUploadUrl(input: UploadInput): Promise<{
    expiresIn: number;
    key: string;
    method: "PUT";
    url: string;
  }>;
  getDownloadUrl(input: DownloadInput): Promise<{
    expiresIn: number;
    method: "GET";
    url: string;
  }>;
  signMultipartPart(input: MultipartPartInput): Promise<{
    expiresIn: number;
    partNumber: number;
    url: string;
  }>;
}

const clientCache = new Map<string, S3Client>();

function buildConfigKey(config: S3ServiceConfig): string {
  return JSON.stringify({
    accessKeyId: config.accessKeyId,
    bucket: config.bucket,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    region: config.region,
    secretAccessKey: config.secretAccessKey,
  });
}

function getSharedS3Client(config: S3ServiceConfig): S3Client {
  const cacheKey = buildConfigKey(config);
  const existingClient = clientCache.get(cacheKey);

  if (existingClient) {
    return existingClient;
  }

  const client = new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    region: config.region,
  });

  clientCache.set(cacheKey, client);
  return client;
}

function resolveConfig(config?: S3ServiceConfigInput): S3ServiceConfig | null {
  if (
    !config?.accessKeyId ||
    !config.bucket ||
    !config.region ||
    !config.secretAccessKey
  ) {
    return null;
  }

  return {
    accessKeyId: config.accessKeyId,
    bucket: config.bucket,
    downloadUrlExpiresIn:
      config.downloadUrlExpiresIn ?? DEFAULT_DOWNLOAD_URL_EXPIRES_IN,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle ?? false,
    region: config.region,
    secretAccessKey: config.secretAccessKey,
    uploadUrlExpiresIn:
      config.uploadUrlExpiresIn ?? DEFAULT_UPLOAD_URL_EXPIRES_IN,
  };
}

function assertS3Configured(
  config: S3ServiceConfig | null
): asserts config is S3ServiceConfig {
  if (config) {
    return;
  }

  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "S3 storage is not configured",
  });
}

function assertUserScopedKey(key: string, userId: string): void {
  if (isUserScopedKey(key, userId)) {
    return;
  }

  throw new ORPCError("FORBIDDEN", {
    message: "Storage key is outside the authenticated user scope",
  });
}

function buildStorageKey(options: {
  filename: string;
  now: Date;
  randomId: string;
  userId: string;
}): string {
  const year = String(options.now.getUTCFullYear());
  const month = String(options.now.getUTCMonth() + 1).padStart(2, "0");
  const filename = sanitizeFilename(options.filename);
  const prefix = buildUserStoragePrefix(options.userId);

  return `${prefix}uploads/${year}/${month}/${options.randomId}-${filename}`;
}

function buildDownloadDisposition(filename?: string): string | undefined {
  if (!filename) {
    return undefined;
  }

  return `attachment; filename="${sanitizeFilename(filename)}"`;
}

function handleS3Failure(operation: string, error: unknown): never {
  console.error(`[S3] ${operation} failed`, error);
  throw new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "S3 storage request failed",
  });
}

export function createS3Service(
  options: {
    config?: S3ServiceConfigInput;
  } = {},
  dependencies: CreateS3ServiceDependencies = {}
): S3Service {
  const config = resolveConfig(options.config);
  const sharedClient = config ? getSharedS3Client(config) : null;
  const client = dependencies.client ?? sharedClient;
  const now = dependencies.now ?? (() => new Date());
  const createRandomId = dependencies.randomId ?? randomUUID;
  const presign =
    dependencies.presign ??
    ((command: object, expiresIn: number) => {
      assertS3Configured(config);
      return getSignedUrl(
        sharedClient ?? getSharedS3Client(config),
        command as never,
        {
          expiresIn,
        }
      );
    });

  return {
    async abortMultipartUpload(input) {
      assertS3Configured(config);
      assertUserScopedKey(input.key, input.userId);

      try {
        await (client ?? getSharedS3Client(config)).send(
          new AbortMultipartUploadCommand({
            Bucket: config.bucket,
            Key: input.key,
            UploadId: input.uploadId,
          })
        );

        return {
          aborted: true as const,
          key: input.key,
        };
      } catch (error) {
        handleS3Failure("abortMultipartUpload", error);
      }
    },

    async completeMultipartUpload(input) {
      assertS3Configured(config);
      assertUserScopedKey(input.key, input.userId);

      try {
        await (client ?? getSharedS3Client(config)).send(
          new CompleteMultipartUploadCommand({
            Bucket: config.bucket,
            Key: input.key,
            MultipartUpload: {
              Parts: input.parts.map((part) => ({
                ETag: part.etag,
                PartNumber: part.partNumber,
              })),
            },
            UploadId: input.uploadId,
          })
        );

        return {
          key: input.key,
        };
      } catch (error) {
        handleS3Failure("completeMultipartUpload", error);
      }
    },

    async createMultipartUpload(input) {
      assertS3Configured(config);

      const key = buildStorageKey({
        filename: input.filename,
        now: now(),
        randomId: createRandomId(),
        userId: input.userId,
      });

      try {
        const response = await (client ?? getSharedS3Client(config)).send(
          new CreateMultipartUploadCommand({
            Bucket: config.bucket,
            ContentType: input.contentType,
            Key: key,
          })
        );

        if (!response.UploadId) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "S3 multipart upload did not return an upload id",
          });
        }

        return {
          key,
          uploadId: response.UploadId,
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }

        handleS3Failure("createMultipartUpload", error);
      }
    },

    async createUploadUrl(input) {
      assertS3Configured(config);

      const key = buildStorageKey({
        filename: input.filename,
        now: now(),
        randomId: createRandomId(),
        userId: input.userId,
      });

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        ContentLength: input.size,
        ContentType: input.contentType,
        Key: key,
      });

      try {
        const url = await presign(command, config.uploadUrlExpiresIn);
        return {
          expiresIn: config.uploadUrlExpiresIn,
          key,
          method: "PUT" as const,
          url,
        };
      } catch (error) {
        handleS3Failure("createUploadUrl", error);
      }
    },

    async getDownloadUrl(input) {
      assertS3Configured(config);
      assertUserScopedKey(input.key, input.userId);

      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: input.key,
        ResponseContentDisposition: buildDownloadDisposition(input.filename),
      });

      try {
        const url = await presign(command, config.downloadUrlExpiresIn);
        return {
          expiresIn: config.downloadUrlExpiresIn,
          method: "GET" as const,
          url,
        };
      } catch (error) {
        handleS3Failure("getDownloadUrl", error);
      }
    },

    async signMultipartPart(input) {
      assertS3Configured(config);
      assertUserScopedKey(input.key, input.userId);

      const command = new UploadPartCommand({
        Bucket: config.bucket,
        Key: input.key,
        PartNumber: input.partNumber,
        UploadId: input.uploadId,
      });

      try {
        const url = await presign(command, config.uploadUrlExpiresIn);
        return {
          expiresIn: config.uploadUrlExpiresIn,
          partNumber: input.partNumber,
          url,
        };
      } catch (error) {
        handleS3Failure("signMultipartPart", error);
      }
    },
  };
}
