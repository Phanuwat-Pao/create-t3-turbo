# Storage Helpers

The storage client helpers live in:

- `apps/nextjs/src/data/storage/storage-mutations.ts`
- `apps/nextjs/src/data/storage/keys.ts`

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

## Manual verification

1. Call `storage.createUploadUrl`, upload a small file with the returned URL, and confirm the object lands under your user prefix.
2. Call `storage.createMultipartUpload`, sign two or more parts, upload them directly to S3, complete the upload, and confirm the final object is readable.
3. Call `storage.getDownloadUrl` for one of your own keys and confirm the signed URL downloads the object.
4. Try `storage.getDownloadUrl` or `storage.signMultipartPart` with a key under another user prefix and confirm the API returns `FORBIDDEN`.
