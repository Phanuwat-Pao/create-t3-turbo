# Storage Helpers

The storage client helpers live in:

- `apps/nextjs/src/data/storage/storage-mutations.ts`
- `apps/nextjs/src/data/storage/keys.ts`
- `apps/nextjs/src/data/storage/upload-file.ts`
- `apps/nextjs/src/rpc/client.ts`

They wrap the authenticated `orpc.storage.*` procedures exposed by `@acme/api`.

## Required server env

- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- optional `S3_ENDPOINT`
- optional `S3_FORCE_PATH_STYLE`
- optional `S3_UPLOAD_URL_EXPIRES_IN`
- optional `S3_DOWNLOAD_URL_EXPIRES_IN`

## Flow

1. Request a presigned upload URL or create a multipart upload from the API.
2. Upload file bytes directly from the client to S3.
3. Complete or abort multipart uploads through the API.
4. Request a presigned download URL when the client needs to read the object.

The app server never proxies file bytes. It only authenticates the caller, scopes keys to `users/<userId>/...`, and signs the S3 operations.

## Browser upload helper

Use `uploadFile(file, options)` from `apps/nextjs/src/data/storage/upload-file.ts` when the browser should upload directly to S3 and you want the helper to choose single-request or multipart mode automatically.

Supported options:

- `onProgress(progress)` for aggregate upload progress
- `signal` for cancellation
- `multipartThresholdBytes` default `8 MiB`
- `partSizeBytes` default `8 MiB`
- `concurrency` default `3`

The progress callback receives:

- `loadedBytes`
- `totalBytes`
- `percent`
- `uploadType`
- `stage`

## Manual verification

1. Call `uploadFile(file)` with a small file, confirm it uses a single signed `PUT`, and verify the object lands under your user prefix.
2. Call `uploadFile(file)` with a file above the multipart threshold, confirm progress updates while parts upload, and verify the final object is readable.
3. Abort a multipart upload with `AbortController` and confirm the helper rejects with `ABORTED`.
4. Call `storage.getDownloadUrl` for one of your own keys and confirm the signed URL downloads the object.
5. Try `storage.getDownloadUrl` or `storage.signMultipartPart` with a key under another user prefix and confirm the API returns `FORBIDDEN`.
