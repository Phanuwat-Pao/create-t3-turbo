import {
  requestAbortMultipartUpload,
  requestCompleteMultipartUpload,
  requestCreateMultipartUpload,
  requestCreateUploadUrl,
  requestSignMultipartPart,
} from "./storage-mutations";

export const DEFAULT_MULTIPART_THRESHOLD_BYTES = 8 * 1024 * 1024;
export const DEFAULT_PART_SIZE_BYTES = 8 * 1024 * 1024;
export const DEFAULT_UPLOAD_CONCURRENCY = 3;

const noopCleanup = () => undefined;

type StorageUploadErrorCode =
  | "ABORTED"
  | "COMPLETE_FAILED"
  | "SIGNING_FAILED"
  | "UPLOAD_FAILED";

type UploadStage = "completing" | "signing" | "uploading";
type UploadType = "multipart" | "single";

interface UploadPartDescriptor {
  blob: Blob;
  partNumber: number;
}

export interface UploadFileOptions {
  concurrency?: number;
  multipartThresholdBytes?: number;
  onProgress?: (progress: StorageUploadProgress) => void;
  partSizeBytes?: number;
  signal?: AbortSignal;
}

export interface UploadFileResult {
  contentType: string;
  filename: string;
  key: string;
  size: number;
  uploadType: UploadType;
}

export interface StorageUploadProgress {
  loadedBytes: number;
  percent: number;
  stage: UploadStage;
  totalBytes: number;
  uploadType: UploadType;
}

export class StorageUploadError extends Error {
  readonly code: StorageUploadErrorCode;

  constructor(
    code: StorageUploadErrorCode,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.code = code;
    this.name = "StorageUploadError";
  }
}

function createAbortError(cause?: unknown): StorageUploadError {
  return new StorageUploadError("ABORTED", "Upload aborted", {
    cause,
  });
}

function createStorageUploadError(
  code: Exclude<StorageUploadErrorCode, "ABORTED">,
  message: string,
  cause: unknown
): StorageUploadError {
  return new StorageUploadError(code, message, {
    cause,
  });
}

function createPartDescriptors(
  file: File,
  partSizeBytes: number
): UploadPartDescriptor[] {
  const parts: UploadPartDescriptor[] = [];
  let offset = 0;
  let partNumber = 1;

  while (offset < file.size) {
    parts.push({
      blob: file.slice(offset, offset + partSizeBytes),
      partNumber,
    });
    offset += partSizeBytes;
    partNumber += 1;
  }

  return parts;
}

function emitProgress(options: {
  loadedBytes: number;
  onProgress?: UploadFileOptions["onProgress"];
  stage: UploadStage;
  totalBytes: number;
  uploadType: UploadType;
}): void {
  options.onProgress?.({
    loadedBytes: options.loadedBytes,
    percent:
      options.totalBytes === 0
        ? 100
        : Math.min(
            100,
            Number(
              ((options.loadedBytes / options.totalBytes) * 100).toFixed(2)
            )
          ),
    stage: options.stage,
    totalBytes: options.totalBytes,
    uploadType: options.uploadType,
  });
}

function getFileMetadata(file: File): {
  contentType: string;
  filename: string;
  size: number;
} {
  return {
    contentType: file.type || "application/octet-stream",
    filename: file.name || "file",
    size: file.size,
  };
}

function hasOwnAbortSignal(signal?: AbortSignal): signal is AbortSignal {
  return !!signal;
}

function isStorageUploadError(error: unknown): error is StorageUploadError {
  return error instanceof StorageUploadError;
}

function rethrowStorageUploadError(error: StorageUploadError): never {
  throw error;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) {
    return;
  }

  throw createAbortError(signal.reason);
}

function withAbortSignal(
  signal: AbortSignal | undefined,
  onAbort: () => void
): () => void {
  if (!signal) {
    return noopCleanup;
  }

  if (signal.aborted) {
    onAbort();
    return noopCleanup;
  }

  signal.addEventListener("abort", onAbort, {
    once: true,
  });

  return () => {
    signal.removeEventListener("abort", onAbort);
  };
}

async function uploadBlob(options: {
  body: Blob;
  contentType?: string;
  onProgress: (loadedBytes: number, totalBytes: number) => void;
  signal?: AbortSignal;
  url: string;
}): Promise<{ etag: string | null }> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const cleanup = withAbortSignal(options.signal, () => request.abort());

    request.open("PUT", options.url);

    if (options.contentType) {
      request.setRequestHeader("Content-Type", options.contentType);
    }

    request.addEventListener("error", () => {
      cleanup();
      reject(
        createStorageUploadError("UPLOAD_FAILED", "Upload request failed", null)
      );
    });

    request.addEventListener("abort", () => {
      cleanup();
      reject(createAbortError(options.signal?.reason));
    });

    request.addEventListener("load", () => {
      cleanup();

      if (request.status >= 200 && request.status < 300) {
        resolve({
          etag: request.getResponseHeader("etag"),
        });
        return;
      }

      reject(
        createStorageUploadError(
          "UPLOAD_FAILED",
          `Upload request failed with status ${request.status}`,
          null
        )
      );
    });

    request.upload.addEventListener("progress", (event) => {
      options.onProgress(event.loaded, event.total || options.body.size);
    });

    throwIfAborted(options.signal);
    request.send(options.body);
  });
}

async function uploadMultipartFile(
  file: File,
  metadata: ReturnType<typeof getFileMetadata>,
  options: UploadFileOptions
): Promise<UploadFileResult> {
  const concurrency = Math.max(
    1,
    options.concurrency ?? DEFAULT_UPLOAD_CONCURRENCY
  );
  const partSizeBytes = Math.max(
    1,
    options.partSizeBytes ?? DEFAULT_PART_SIZE_BYTES
  );
  const progressByPart = new Map<number, number>();
  const abortController = new AbortController();
  const unlinkAbortSignal = withAbortSignal(options.signal, () =>
    abortController.abort(options.signal?.reason)
  );

  emitProgress({
    loadedBytes: 0,
    onProgress: options.onProgress,
    stage: "signing",
    totalBytes: metadata.size,
    uploadType: "multipart",
  });

  let multipartKey = "";
  let uploadId = "";
  let shouldAbortMultipart = false;

  try {
    throwIfAborted(options.signal);

    const multipartUpload = await requestCreateMultipartUpload({
      contentType: metadata.contentType,
      filename: metadata.filename,
      size: metadata.size,
    }).catch((error: unknown) => {
      throw createStorageUploadError(
        "SIGNING_FAILED",
        "Failed to create multipart upload",
        error
      );
    });

    multipartKey = multipartUpload.key;
    ({ uploadId } = multipartUpload);
    shouldAbortMultipart = true;

    const parts = createPartDescriptors(file, partSizeBytes);
    const completedParts: { etag: string; partNumber: number }[] = [];
    let nextIndex = 0;
    let firstError: StorageUploadError | null = null;

    const emitAggregateProgress = (stage: UploadStage) => {
      const loadedBytes = [...progressByPart.values()].reduce(
        (sum, value) => sum + value,
        0
      );

      emitProgress({
        loadedBytes,
        onProgress: options.onProgress,
        stage,
        totalBytes: metadata.size,
        uploadType: "multipart",
      });
    };

    const markFailure = (error: StorageUploadError) => {
      if (firstError) {
        return;
      }

      firstError = error;
      abortController.abort(error);
    };

    const uploadPart = async (part: UploadPartDescriptor) => {
      emitAggregateProgress("signing");

      const signedPart = await requestSignMultipartPart({
        key: multipartKey,
        partNumber: part.partNumber,
        uploadId,
      }).catch((error: unknown) => {
        throw createStorageUploadError(
          "SIGNING_FAILED",
          "Failed to sign multipart upload part",
          error
        );
      });

      const result = await uploadBlob({
        body: part.blob,
        onProgress: (loadedBytes) => {
          progressByPart.set(part.partNumber, loadedBytes);
          emitAggregateProgress("uploading");
        },
        signal: abortController.signal,
        url: signedPart.url,
      });

      const { etag } = result;

      if (!etag) {
        throw createStorageUploadError(
          "UPLOAD_FAILED",
          "Multipart upload part did not return an ETag",
          null
        );
      }

      completedParts.push({
        etag,
        partNumber: part.partNumber,
      });
    };

    const workers = Array.from(
      { length: Math.min(concurrency, parts.length) },
      async () => {
        while (!abortController.signal.aborted) {
          const part = parts[nextIndex];

          if (!part) {
            return;
          }

          nextIndex += 1;

          try {
            await uploadPart(part);
          } catch (error) {
            if (isStorageUploadError(error)) {
              markFailure(error);
              return;
            }

            markFailure(
              createStorageUploadError(
                "UPLOAD_FAILED",
                "Multipart upload failed",
                error
              )
            );
            return;
          }
        }
      }
    );

    await Promise.allSettled(workers);

    if (firstError) {
      rethrowStorageUploadError(firstError);
    }

    throwIfAborted(options.signal);

    emitProgress({
      loadedBytes: metadata.size,
      onProgress: options.onProgress,
      stage: "completing",
      totalBytes: metadata.size,
      uploadType: "multipart",
    });

    await requestCompleteMultipartUpload({
      key: multipartKey,
      parts: completedParts.toSorted(
        (left, right) => left.partNumber - right.partNumber
      ),
      uploadId,
    }).catch((error: unknown) => {
      throw createStorageUploadError(
        "COMPLETE_FAILED",
        "Failed to complete multipart upload",
        error
      );
    });

    shouldAbortMultipart = false;

    return {
      contentType: metadata.contentType,
      filename: metadata.filename,
      key: multipartKey,
      size: metadata.size,
      uploadType: "multipart",
    };
  } catch (error) {
    if (shouldAbortMultipart && multipartKey && uploadId) {
      await requestAbortMultipartUpload({
        key: multipartKey,
        uploadId,
      }).catch(() => undefined);
    }

    if (isStorageUploadError(error)) {
      throw error;
    }

    if (hasOwnAbortSignal(options.signal) && options.signal.aborted) {
      throw createAbortError(options.signal.reason);
    }

    throw createStorageUploadError(
      "UPLOAD_FAILED",
      "Multipart upload failed",
      error
    );
  } finally {
    unlinkAbortSignal();
  }
}

async function uploadSingleFile(
  file: File,
  metadata: ReturnType<typeof getFileMetadata>,
  options: UploadFileOptions
): Promise<UploadFileResult> {
  emitProgress({
    loadedBytes: 0,
    onProgress: options.onProgress,
    stage: "signing",
    totalBytes: metadata.size,
    uploadType: "single",
  });

  const signedUpload = await requestCreateUploadUrl({
    contentType: metadata.contentType,
    filename: metadata.filename,
    size: metadata.size,
  }).catch((error: unknown) => {
    throw createStorageUploadError(
      "SIGNING_FAILED",
      "Failed to create upload URL",
      error
    );
  });

  throwIfAborted(options.signal);

  await uploadBlob({
    body: file,
    contentType: metadata.contentType,
    onProgress: (loadedBytes, totalBytes) => {
      emitProgress({
        loadedBytes,
        onProgress: options.onProgress,
        stage: "uploading",
        totalBytes,
        uploadType: "single",
      });
    },
    signal: options.signal,
    url: signedUpload.url,
  });

  emitProgress({
    loadedBytes: metadata.size,
    onProgress: options.onProgress,
    stage: "uploading",
    totalBytes: metadata.size,
    uploadType: "single",
  });

  return {
    contentType: metadata.contentType,
    filename: metadata.filename,
    key: signedUpload.key,
    size: metadata.size,
    uploadType: "single",
  };
}

export async function uploadFile(
  file: File,
  options: UploadFileOptions = {}
): Promise<UploadFileResult> {
  const metadata = getFileMetadata(file);
  const multipartThresholdBytes =
    options.multipartThresholdBytes ?? DEFAULT_MULTIPART_THRESHOLD_BYTES;

  if (file.size < multipartThresholdBytes) {
    return uploadSingleFile(file, metadata, options);
  }

  return uploadMultipartFile(file, metadata, options);
}
