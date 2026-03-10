# `@acme/e2e`

Thin Playwright workspace for smoke-testing the real Next.js app in this monorepo.

## Setup

1. Install dependencies with `pnpm i`.
2. Make sure the root `.env` file exists. You can copy `.env.example` if you need a starting point.
3. Install the Chromium browser once with `pnpm e2e:install`.

## Commands

- `pnpm e2e`: run the smoke suite in headless Chromium.
- `pnpm e2e:headed`: run the smoke suite in a headed browser.
- `pnpm e2e:ui`: open the Playwright UI runner.
- `pnpm e2e:debug`: run the suite in Playwright debug mode.

## What it tests

The first smoke test keeps to public, unauthenticated behavior:

- `/en/sign-in` renders the sign-in entry point.
- `/en/dashboard` redirects unauthenticated traffic back to `/en/sign-in`.

The workspace starts `@acme/nextjs` directly through Playwright's `webServer` support so the tests always target the real app.
