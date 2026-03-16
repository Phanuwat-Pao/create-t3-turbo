# Storage Upload Client Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a browser-side `uploadFile(file, options)` helper to the Next.js app that uploads directly to S3 with automatic single-versus-multipart selection, progress callbacks, and cancellation.

**Architecture:** Keep the server boundary unchanged by using the existing authenticated `orpc.storage.*` procedures for signing and multipart lifecycle control. Implement a browser-only helper backed by `XMLHttpRequest` so upload progress and cancellation work for both single and multipart uploads.

**Tech Stack:** Next.js, TypeScript, oRPC TanStack helpers, Vitest, `XMLHttpRequest`

---

### Task 1: Add focused Next.js test setup for storage upload helpers

**Files:**
- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/package.json`
- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/vitest.config.ts`
- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/vitest.setup.ts`

**Step 1: Write the failing test**

Reference a future `upload-file.test.ts` file from the package test script so the package has an executable browser-safe unit test entry point.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 -F @acme/nextjs test`

Expected: fail because the config or test file does not exist yet.

**Step 3: Write minimal implementation**

Add a `vitest` script and a minimal config that runs in a DOM-like environment and loads a small setup file.

**Step 4: Run test to verify it passes or reaches the next failure**

Run the same command and confirm the runner boots and reports the missing upload utility tests as the next failure.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 add apps/nextjs/package.json apps/nextjs/vitest.config.ts apps/nextjs/vitest.setup.ts
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 commit -m "test: add nextjs storage helper test setup"
```

### Task 2: Add failing tests for single, multipart, progress, and abort flows

**Files:**
- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/src/data/storage/upload-file.test.ts`

**Step 1: Write the failing test**

Cover:
- single upload below threshold calls `createUploadUrl` and uploads once
- multipart upload above threshold calls multipart procedures and completes with ordered parts
- progress callback receives aggregate bytes and reaches 100%
- abort signal stops uploads and surfaces `ABORTED`
- multipart upload failure triggers best-effort `abortMultipartUpload`

Use stubbed `XMLHttpRequest` and mocked storage mutation helpers.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 -F @acme/nextjs test`

Expected: fail because `upload-file.ts` does not exist yet.

**Step 3: Write minimal implementation**

Only add the minimum test harness helpers needed to express the desired behavior clearly.

**Step 4: Run test to verify it still fails for the intended missing implementation**

Re-run the same command and confirm failure points to the missing helper exports or behavior.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 add apps/nextjs/src/data/storage/upload-file.test.ts
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 commit -m "test: add storage upload utility coverage"
```

### Task 3: Implement the browser-side upload helper

**Files:**
- Create: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/src/data/storage/upload-file.ts`
- Optionally modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/src/data/storage/keys.ts`
- Optionally modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/src/data/storage/storage-mutations.ts`

**Step 1: Write the failing test**

Use the existing test file to drive the public contract:
- `uploadFile`
- `StorageUploadError`
- progress payload shape

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 -F @acme/nextjs test`

Expected: fail because the helper behavior is not implemented yet.

**Step 3: Write minimal implementation**

Implement:
- threshold-based single versus multipart selection
- `XMLHttpRequest` upload helper with progress and abort support
- multipart part slicing and bounded concurrency
- ordered completion payload
- best-effort multipart abort on failure
- typed result and typed `StorageUploadError`

Keep all file bytes in the browser and use the existing oRPC mutation helpers to sign requests.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 -F @acme/nextjs test`

Expected: pass for the new upload helper tests.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 add apps/nextjs/src/data/storage/upload-file.ts apps/nextjs/src/data/storage/storage-mutations.ts apps/nextjs/src/data/storage/keys.ts
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 commit -m "feat: add browser storage upload helper"
```

### Task 4: Document and verify the new helper

**Files:**
- Modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/apps/nextjs/src/data/storage/README.md`
- Optionally modify: `/Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3/README.md`

**Step 1: Write the failing test**

Update the manual verification checklist to include the new helper contract and browser-side cancellation/progress expectations.

**Step 2: Run verification to confirm current gap**

Run the full verification set after implementation and note any missing docs or failing checks.

**Step 3: Write minimal implementation**

Document:
- `uploadFile(file, options)` usage
- threshold behavior
- progress callback shape
- cancellation behavior

**Step 4: Run verification**

Run:
- `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 -F @acme/nextjs test`
- `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 -F @acme/nextjs typecheck`
- `pnpm -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 -F @acme/nextjs build`

Expected: all pass.

**Step 5: Commit**

```bash
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 add apps/nextjs/src/data/storage/README.md README.md
git -C /Users/phanuwatluadthai/Documents/repositories/create-t3-turbo/.worktrees/presigned-s3 commit -m "docs: add upload helper usage notes"
```
