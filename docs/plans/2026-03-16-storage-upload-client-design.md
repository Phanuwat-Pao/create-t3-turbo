# Storage Upload Client Design

## Goal

Add a browser-side `uploadFile(file, options)` helper for the Next.js app that uploads directly to S3 using the existing authenticated presigned storage API.

## Scope

- Add a single high-level helper for browser uploads.
- Automatically choose single-request upload or multipart upload based on a configurable size threshold.
- Report aggregate upload progress.
- Support cancellation through `AbortSignal`.
- Keep file bytes out of the app server.

## Constraints

- The helper must use the existing `orpc.storage.*` procedures for signing and multipart lifecycle control.
- Upload progress must work in the browser, so the transport cannot rely on `fetch` alone.
- Multipart uploads must respect S3 part-size requirements.
- The first version should fit the current `apps/nextjs/src/data/storage` helper pattern.

## Proposed Architecture

### High-level helper

Create `apps/nextjs/src/data/storage/upload-file.ts` with a single exported function:

- `uploadFile(file, options)`

Planned options:

- `signal?: AbortSignal`
- `onProgress?: (progress) => void`
- `multipartThresholdBytes?: number`
- `partSizeBytes?: number`
- `concurrency?: number`

Planned result:

- `key`
- `contentType`
- `filename`
- `size`
- `uploadType`

### Execution flow

If `file.size` is below the multipart threshold, the helper will:

1. Call `storage.createUploadUrl`.
2. Upload the file with an `XMLHttpRequest` `PUT` request.
3. Report progress from `xhr.upload.onprogress`.
4. Return the final key and metadata.

If `file.size` is at or above the multipart threshold, the helper will:

1. Call `storage.createMultipartUpload`.
2. Slice the file into parts.
3. Request part URLs through `storage.signMultipartPart`.
4. Upload parts directly to S3 with bounded concurrency using `XMLHttpRequest`.
5. Aggregate per-part progress into a single callback.
6. Call `storage.completeMultipartUpload` with ordered `{ partNumber, etag }[]`.
7. Best-effort call `storage.abortMultipartUpload` if a part upload fails after initiation.

### Progress model

The helper will emit a consistent progress payload:

- `loadedBytes`
- `totalBytes`
- `percent`
- `uploadType`
- `stage`

Stages will cover at least:

- `signing`
- `uploading`
- `completing`

The callback should be monotonic for uploaded bytes and aggregate all active multipart uploads.

## Error Handling

Expose a typed `StorageUploadError` with stable codes:

- `ABORTED`
- `SIGNING_FAILED`
- `UPLOAD_FAILED`
- `COMPLETE_FAILED`

Abort behavior:

- stop scheduling more part uploads
- abort in-flight XHR requests
- best-effort abort the multipart session on the API
- throw `StorageUploadError` with `code: "ABORTED"`

## Testing

Add focused Vitest coverage in `apps/nextjs` for:

- single upload path below threshold
- multipart upload path above threshold
- progress aggregation
- cancellation via `AbortSignal`
- best-effort multipart abort on upload failure

Use a stubbed `XMLHttpRequest` implementation so tests remain fast and deterministic.
