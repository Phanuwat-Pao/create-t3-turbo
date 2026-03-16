# Presigned S3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add authenticated presigned S3 upload and download support to `@acme/api`, including both single-request and multipart direct-to-S3 uploads, with user-scoped keys and no file bytes flowing through the app server.

**Architecture:** Extend the existing oRPC context with a reusable `context.s3` service backed by a shared AWS `S3Client`, then add a protected `storage` router that delegates to that service. Keys are generated or validated under `users/<userId>/...`, and the first version remains stateless with no database-backed file registry.

**Tech Stack:** oRPC, Better Auth session context, AWS SDK v3 for S3, Zod v4, TypeScript, tsgo

---

### Task 1: Add shared storage validation schemas

**Files:**

- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/validators/src/index.ts`
- Test: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/validators/src/index.test.ts`

**Step 1: Write the failing test**

Write a focused test file for:

- valid upload input with filename and content type
- invalid key outside `users/<userId>/`
- invalid multipart part numbers

Example cases to cover:

```ts
assert.equal(
  isUserScopedKey("users/user_123/uploads/2026/03/file.png", "user_123"),
  true
);
assert.equal(
  isUserScopedKey("users/other/uploads/file.png", "user_123"),
  false
);
```

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/validators test`

Expected: fail because the schemas/helpers and test script do not exist yet.

**Step 3: Write minimal implementation**

Add Zod schemas and small helper utilities for:

- filename normalization
- user-scoped key validation
- upload request payloads
- multipart completion payloads

Export them from `packages/validators/src/index.ts`.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/validators test`

Expected: pass for the new validator cases.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo add packages/validators/src/index.ts packages/validators/src/index.test.ts packages/validators/package.json
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo commit -m "feat: add storage validators"
```

### Task 2: Add S3 env support in the Next.js server runtime

**Files:**

- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/apps/nextjs/src/env.ts`
- Reference: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/auth/env.ts`

**Step 1: Write the failing test**

Add or extend a small env validation test that proves missing required S3 vars are rejected in non-CI validation mode.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/nextjs typecheck`

Expected: fail after temporarily referencing new env fields that are not yet declared.

**Step 3: Write minimal implementation**

Add server env entries for:

- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- optional `S3_ENDPOINT`
- optional `S3_FORCE_PATH_STYLE`
- optional `S3_UPLOAD_URL_EXPIRES_IN`
- optional `S3_DOWNLOAD_URL_EXPIRES_IN`

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/nextjs typecheck`

Expected: pass with the new env declarations in place.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo add apps/nextjs/src/env.ts
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo commit -m "feat: add storage env config"
```

### Task 3: Implement the shared S3 service for oRPC context

**Files:**

- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/api/src/s3.ts`
- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/api/src/orpc.ts`
- Test: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/api/src/s3.test.ts`

**Step 1: Write the failing test**

Add service tests for:

- generated keys stay under `users/<userId>/`
- single upload returns a presigned `PutObject` URL
- multipart initiation returns `{ key, uploadId }`
- multipart part signing enforces the caller prefix
- download signing rejects cross-user keys

Mock the AWS SDK boundary at the service layer instead of testing AWS internals.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/api test`

Expected: fail because `src/s3.ts` and the service contract do not exist yet.

**Step 3: Write minimal implementation**

Create `src/s3.ts` with:

- shared `S3Client`
- config loader
- key generation helper
- service factory exposing:
  - `createUploadUrl`
  - `createMultipartUpload`
  - `signMultipartPart`
  - `completeMultipartUpload`
  - `abortMultipartUpload`
  - `getDownloadUrl`

Extend the context type in `src/orpc.ts` to include:

```ts
s3: ReturnType<typeof createS3Service>;
```

Attach `s3` inside `createContext()`.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/api test`

Expected: pass for the new S3 service tests.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo add packages/api/src/s3.ts packages/api/src/s3.test.ts packages/api/src/orpc.ts packages/api/package.json
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo commit -m "feat: add context-backed s3 service"
```

### Task 4: Add protected storage procedures to the API router

**Files:**

- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/api/src/router/storage.ts`
- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/api/src/root.ts`
- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/api/src/index.ts`
- Test: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/packages/api/src/router/storage.test.ts`

**Step 1: Write the failing test**

Add router tests that verify:

- unauthenticated callers are rejected
- authenticated callers receive upload URLs
- multipart completion delegates correctly
- download URL signing rejects keys outside the user prefix

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/api test`

Expected: fail because the storage router is not registered yet.

**Step 3: Write minimal implementation**

Create protected procedures:

- `createUploadUrl`
- `createMultipartUpload`
- `signMultipartPart`
- `completeMultipartUpload`
- `abortMultipartUpload`
- `getDownloadUrl`

Each procedure should:

- trust only `context.session.user.id`
- call `context.s3.*`
- avoid inline AWS logic

Register the router under `.prefix("/storage")`.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/api test`

Expected: pass for the storage router tests.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo add packages/api/src/router/storage.ts packages/api/src/router/storage.test.ts packages/api/src/root.ts packages/api/src/index.ts
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo commit -m "feat: add storage api procedures"
```

### Task 5: Expose the storage API to the Next.js client

**Files:**

- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/apps/nextjs/src/rpc/react.tsx`
- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/apps/nextjs/src/rpc/server.tsx`
- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/apps/nextjs/src/data/storage/storage-mutations.ts`
- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/apps/nextjs/src/data/storage/keys.ts`

**Step 1: Write the failing test**

Add a small client-level test or type-level usage file proving the new router methods are available from `orpc.storage.*`.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/nextjs typecheck`

Expected: fail when referencing `orpc.storage.*` before the router types propagate.

**Step 3: Write minimal implementation**

Add client helpers for:

- requesting a single upload URL
- starting multipart uploads
- signing individual parts
- completing uploads
- aborting uploads
- requesting download URLs

Keep helpers thin and delegate to `orpc`.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/nextjs typecheck`

Expected: pass with the new storage client helpers.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo add apps/nextjs/src/rpc/react.tsx apps/nextjs/src/rpc/server.tsx apps/nextjs/src/data/storage/storage-mutations.ts apps/nextjs/src/data/storage/keys.ts
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo commit -m "feat: expose storage client helpers"
```

### Task 6: Add verification and usage notes

**Files:**

- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/AGENTS.md`
- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/README.md`
- Optionally create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/apps/nextjs/src/data/storage/README.md`

**Step 1: Write the failing test**

Write a short manual verification checklist covering:

- authenticated single upload flow
- authenticated multipart flow
- authenticated download flow
- cross-user key rejection

**Step 2: Run verification to expose current gaps**

Run:

```bash
pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/api typecheck
pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/nextjs typecheck
```

Expected: note any remaining gaps before final docs are written.

**Step 3: Write minimal implementation**

Document:

- required S3 env vars
- example API usage flow
- direct-to-S3 guarantee
- deferred Better Auth avatar integration

**Step 4: Run final verification**

Run:

```bash
pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/api typecheck
pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo -F @acme/nextjs typecheck
pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo check
```

Expected: all commands pass, or any failures are documented explicitly before completion.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo add README.md AGENTS.md docs/plans/2026-03-16-presigned-s3-design.md docs/plans/2026-03-16-presigned-s3.md
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo commit -m "docs: add storage implementation notes"
```

### Notes

- The first implementation should not touch Better Auth `user.image`.
- The first implementation should not add database tables unless new requirements appear.
- If no test runner exists yet in `@acme/api` or `@acme/validators`, add the smallest possible package-local test setup instead of introducing a repo-wide test framework.
- Keep AWS interaction isolated to `packages/api/src/s3.ts`.
