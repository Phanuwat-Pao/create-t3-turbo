# Presigned S3 Design

## Goal

Add authenticated, direct-to-S3 upload and download support to `@acme/api` without sending file bytes through the application server.

## Scope

- Add a storage service to oRPC context as `context.s3.*`.
- Support both non-multipart and multipart presigned uploads.
- Support presigned downloads.
- Restrict all operations to authenticated users only.
- Generate object keys under `users/<userId>/...`.
- Defer Better Auth `user.image` integration.

## Constraints

- The app server must never proxy upload or download bytes.
- Clients may only request presigned operations for keys inside their own user prefix.
- The first version does not require a database-backed file registry.
- The design must fit the current `@acme/api` oRPC router and context pattern.

## Proposed Architecture

### Context service

Extend `packages/api/src/orpc.ts` context with an `s3` service:

- `createUploadUrl`
- `createMultipartUpload`
- `signMultipartPart`
- `completeMultipartUpload`
- `abortMultipartUpload`
- `getDownloadUrl`

`createContext()` will attach a thin request-safe wrapper that is initialized from a shared module-level `S3Client`. Procedures will call `context.s3.*` instead of building AWS commands inline.

### Router surface

Add a protected `storage` router in `packages/api/src/router/storage.ts` and register it in `packages/api/src/root.ts`.

Planned procedures:

- `createUploadUrl`
- `createMultipartUpload`
- `signMultipartPart`
- `completeMultipartUpload`
- `abortMultipartUpload`
- `getDownloadUrl`

Each procedure will:

- require an authenticated session
- derive `userId` from `context.session.user.id`
- generate or validate keys under `users/<userId>/...`
- return presigned URLs or multipart control data only

## Key Strategy

The server owns key generation. Clients submit metadata such as filename and content type, but do not supply arbitrary root paths.

Recommended prefixes:

- standard uploads: `users/<userId>/uploads/<date>/<random>-<sanitized-name>`
- multipart uploads: `users/<userId>/uploads/<date>/<random>-<sanitized-name>`

Downloads accept an existing key, but the server must reject any key outside the caller's prefix.

## Validation

Inputs should be validated with narrow schemas:

- filename
- content type
- optional file size
- optional content disposition for downloads
- multipart part number
- multipart completion payload with ordered `partNumber` and `etag`

Validation rules:

- reject empty or malformed filenames
- reject invalid part numbers
- reject keys outside `users/<userId>/`
- reject unsupported content types if policy is added later

## Environment

Add server env values for the storage service:

- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- optional `S3_ENDPOINT`
- optional `S3_FORCE_PATH_STYLE`
- optional upload/download expiry settings

These should be validated through the existing env pattern used by `apps/nextjs/src/env.ts`.

## Error Handling

Map errors to stable API behavior:

- unauthenticated: `UNAUTHORIZED`
- invalid input: `BAD_REQUEST`
- key outside user scope: `FORBIDDEN`
- S3 operation failure: internal API error with server-side logging

The server should log AWS failures with operation context, but should not leak provider internals to the client.

## Deferred Work

- Better Auth avatar storage in `user.image`
- file listing APIs
- persistent file metadata in Postgres
- quotas, retention, and background cleanup
- sharing or cross-user object access

## Verification Target

- API package typecheck passes
- Next.js app typecheck passes if client consumption is added
- focused unit coverage for key generation and prefix validation once a test runner is introduced or enabled
