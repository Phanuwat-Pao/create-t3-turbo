import { z } from "zod/v4";

export function sanitizeFilename(filename: string): string {
  const lastSegment = filename
    .split(/[/\\]/)
    .map((segment) => segment.trim())
    .findLast((segment) => segment.length > 0);

  const sanitized = (lastSegment ?? "")
    .replaceAll(/[^A-Za-z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^[-.]+|[-.]+$/g, "");

  return sanitized || "file";
}

export function buildUserStoragePrefix(userId: string): string {
  const safeUserId = userId.trim().replaceAll(/[^A-Za-z0-9_-]+/g, "-");
  return `users/${safeUserId}/`;
}

export function isUserScopedKey(key: string, userId: string): boolean {
  if (key.includes("..")) {
    return false;
  }

  return key.startsWith(buildUserStoragePrefix(userId));
}

const SanitizedFilenameSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .transform(sanitizeFilename);

const ContentTypeSchema = z.string().trim().min(1).max(255);

const StorageObjectKeySchema = z.string().trim().min(1).max(1024);

export const SingleUploadRequestSchema = z.object({
  contentType: ContentTypeSchema,
  filename: SanitizedFilenameSchema,
  size: z.int().positive().optional(),
});

export const MultipartUploadRequestSchema = z.object({
  contentType: ContentTypeSchema,
  filename: SanitizedFilenameSchema,
  size: z.int().positive().optional(),
});

export const SignMultipartPartRequestSchema = z.object({
  key: StorageObjectKeySchema,
  partNumber: z.int().min(1).max(10_000),
  uploadId: z.string().trim().min(1),
});

export const CompletedMultipartPartSchema = z.object({
  etag: z.string().trim().min(1),
  partNumber: z.int().min(1).max(10_000),
});

export const CompleteMultipartUploadRequestSchema = z
  .object({
    key: StorageObjectKeySchema,
    parts: z.array(CompletedMultipartPartSchema).min(1),
    uploadId: z.string().trim().min(1),
  })
  .superRefine((input, ctx) => {
    const seen = new Set<number>();

    for (const [index, part] of input.parts.entries()) {
      const previousPartNumber = input.parts[index - 1]?.partNumber;

      if (seen.has(part.partNumber)) {
        ctx.addIssue({
          code: "custom",
          message: "part numbers must be unique",
          path: ["parts", index, "partNumber"],
        });
      }

      if (
        previousPartNumber !== undefined &&
        previousPartNumber >= part.partNumber
      ) {
        ctx.addIssue({
          code: "custom",
          message: "parts must be sorted by part number",
          path: ["parts", index, "partNumber"],
        });
      }

      seen.add(part.partNumber);
    }
  });

export const DownloadUrlRequestSchema = z.object({
  filename: SanitizedFilenameSchema.optional(),
  key: StorageObjectKeySchema,
});

export type SingleUploadRequest = z.infer<typeof SingleUploadRequestSchema>;
export type MultipartUploadRequest = z.infer<
  typeof MultipartUploadRequestSchema
>;
export type SignMultipartPartRequest = z.infer<
  typeof SignMultipartPartRequestSchema
>;
export type CompleteMultipartUploadRequest = z.infer<
  typeof CompleteMultipartUploadRequestSchema
>;
export type DownloadUrlRequest = z.infer<typeof DownloadUrlRequestSchema>;
