# GuardTour (create-t3-turbo)

A pnpm + Turborepo monorepo built on the T3 stack: a Next.js 16 web app and an
Expo SDK 57 mobile app sharing one typed oRPC API, one Drizzle v1 Postgres
schema, and one Better Auth setup.

## What makes this repo special?

This is a template-grade codebase: it exists to demonstrate the current best
version of this stack. Two standing policies follow from that:

1. **Always latest.** Dependencies are kept at the absolute latest — including
   major bumps and prerelease lines already adopted (Drizzle v1 RC). Shared
   versions live in the `catalog:` section of `pnpm-workspace.yaml`;
   security floors for transitive deps live in its `overrides:` block.
2. **The gates are the product.** Every commit must pass the full lefthook
   pre-commit suite. Fixing the blocker is the job; bypassing the gate is not.

## A small glossary

- **you** — the agent reading this file and changing this repo.
- **user** — the developer directing you.
- **catalog** — the shared dependency versions in `pnpm-workspace.yaml`;
  workspace `package.json`s reference them as `catalog:` / `catalog:react19`.
- **gate** — a lefthook pre-commit job. All must pass for a commit to land.
- **generated schema** — `packages/db/src/auth-schema.ts`, written by
  `pnpm auth:generate`. Never edited by hand.

## The ways to hurt yourself

1. **Bypassing git hooks.** Never `git commit --no-verify` (or `-n`). The
   pre-commit suite is: `check:fix` (repo-wide format+lint with
   `stage_fixed: true`), then parallel `audit-critical`, `typecheck`,
   `lint:ws` (sherif), and `build`. The audit takes ~10 minutes — accept it.
   If a gate fails, fix the cause and commit again through the hooks.
2. **Hand-editing generated auth schema.** `packages/db/src/auth-schema.ts`
   comes from `pnpm auth:generate` (Better Auth CLI). Change auth config in
   `packages/auth/src/index.ts`, then regenerate. Two post-regen fixups this
   repo maintains (re-apply them after every regen): strip the drizzle-v0
   `relations()` blocks the CLI emits (relations live in `relations.ts` via
   `defineRelations`), and add `{ withTimezone: true }` to every
   `timestamp(...)` column — this repo's columns are `timestamptz`, while the
   CLI emits plain `timestamp`.
3. **Pushing schema at the wrong database.** `pnpm db:push` applies
   `packages/db/src/schema.ts` directly to `POSTGRES_URL` from `.env` (it
   swaps port 6543 → 5432 for the non-pooling connection). Know which
   database `.env` points at before running it.
4. **Desyncing the Expo deep-link scheme.** `scheme` in
   `apps/expo/app.config.ts` and the mobile origin in `trustedOrigins`
   (`packages/auth/src/index.ts`) must match: the session cookie is redirected
   to that scheme after mobile OAuth. Keep it app-specific — the `expo()`
   plugin already trusts the broad `exp://` scheme in development only, and a
   generic scheme trusted in production could hand the session to a deep link
   this app does not control. Renaming it also means updating the callback
   URLs registered with each OAuth provider.
5. **Fighting the toolchain by hand.** Ultracite (oxlint + oxfmt) is the
   source of truth for style and will rewrite files repo-wide during commit.
   Don't hand-format; run `pnpm check:fix`. When a rule is genuinely wrong
   for a site, use the narrowest suppression with a reason:
   `// oxlint-disable-next-line <rule> -- <why>`. Rule-level opt-outs go in
   `oxlint.config.ts` with a comment (see the existing ones for the pattern).

## Hit every surface

A change that works where you tested it and is missing everywhere else is the
most common defect. Before calling work done, walk this list:

- **Apps.** `apps/nextjs` (web) and `apps/expo` (mobile) share the API, auth,
  and validators. A feature that touches shared packages needs a decision for
  both apps, even if the decision is "web only".
- **Catalogs.** A dependency shared by more than one workspace belongs in the
  catalog, not duplicated. `sherif` runs on postinstall and fails the install
  on version drift across workspaces.
- **Auth surface.** Auth changes ripple: `packages/auth` config →
  `pnpm auth:generate` → `packages/db/src/auth-schema.ts` →
  `packages/db/src/relations.ts` → both app clients.
- **i18n.** The web app is dictionary-based (`[lang]` routes); the Expo app
  uses i18next with `en`/`th` resources. User-visible strings need entries in
  both places they appear.
- **Env.** New environment variables go through the t3-env definitions
  (`apps/nextjs/src/env.ts`, `packages/auth/env.ts`) and `turbo.json`'s
  `globalEnv` when tasks depend on them.

## Where code lives

- `apps/nextjs` — Next.js 16 App Router under `src/`, React 19 + React
  Compiler, Tailwind CSS 4, oRPC client + TanStack Query/Form, Better Auth
  client, presigned-S3 storage helpers.
- `apps/expo` — Expo SDK 57 (expo-router, React Native 0.86, uniwind) under
  `src/`.
- `apps/e2e` — Playwright end-to-end tests.
- `packages/api` — oRPC router, context, and the S3 service
  (`src/s3.ts`; AWS interaction stays isolated here).
- `packages/auth` — Better Auth runtime config (`initAuth`) and the schema
  generator script.
- `packages/db` — Drizzle ORM v1 (RC line): `schema.ts` uses a snake_case
  `pgTableCreator`; relations use the v2 relational API (`defineRelations`)
  in `relations.ts`; client in `client.ts`.
- `packages/ui` — shared shadcn/radix components. Add new ones with
  `pnpm ui-add`, not by hand-copying.
- `packages/validators` — shared Zod schemas and helpers.
- `tooling/*` — shared TypeScript, Tailwind, and GitHub Actions config.

Keep new code in each workspace's `src/` and group files by feature.

## Build, test, and development commands

- `pnpm i` — install (runs sherif via postinstall).
- `pnpm dev` — all dev tasks in watch mode; `pnpm dev:next` — web app only.
- `pnpm build` — build all workspaces.
- `pnpm typecheck` — `tsgo --noEmit` (TypeScript native preview) everywhere.
- `pnpm check` / `pnpm check:fix` — Ultracite lint+format verify / auto-fix.
- `pnpm -F <workspace> test` — Vitest for `@acme/api`, `@acme/nextjs`,
  `@acme/validators` (globals enabled via each `vitest.config.ts`).
- `pnpm e2e` — Playwright suite (`pnpm e2e:install` once for browsers).
- `pnpm db:push` / `pnpm db:studio` — Drizzle Kit against `.env`.
- `pnpm auth:generate` — regenerate the Better Auth schema.
- `pnpm ui-add` — add a shadcn component to `packages/ui`.

## Verifying

Smallest proof first: run the tests for what you touched and typecheck the
scope you changed. Escalate to `pnpm build` when a change could break page
data collection (auth config, env, route handlers — these execute at build
time). Tests colocate with source as `*.test.ts`; suites exist in
`packages/validators`, `packages/api`, and `apps/nextjs` — behavior changes
in those areas ship with focused tests. The pre-commit gate re-runs
typecheck, lint, and build anyway; arriving at commit time already green
keeps the ~10-minute audit the only wait.

## Coding style & naming conventions

TypeScript throughout; 2-space indent; semicolons. Files kebab-case
(`sign-in-form.tsx`); components/types PascalCase; variables/functions
camelCase. Prefer inferred types locally and explicit types on shared/public
APIs. Prefer `const`, early returns, optional chaining, and `for...of`.
The formatter prefers arrow callbacks and sorted keys — let it win.

React specifics: the React Compiler is enabled, and its lint rule is
error-level. Don't fight it — avoid setState-in-effect (use
`useSyncExternalStore` for external stores like media queries; see
`packages/ui/hooks/use-mobile.ts`), don't read or write refs during render,
and skip manual `useCallback`/`useMemo` where the compiler flags it.

## Commit & pull request guidelines

Conventional Commits in plain language (`feat:`, `fix:`, `chore:`,
`refactor:`), one logical change per commit, committed through the hooks.
PRs include: what changed and why, affected workspaces (`apps/nextjs`,
`packages/db`, …), migration notes for `.env`/schema/auth changes, and
screenshots or video for UI changes. Never open a PR unless the user asks.

## Taste

- Complexity belongs at the boundaries (adapters, services like `s3.ts`);
  routers stay thin, UI stays dumb.
- Fight scope creep; honor the user's intent minimally and realistically.
- Comments describe how a thing is used, not every line of behavior, and
  move when the code moves.
- If a rule here fights the task in front of you, say so loudly and get the
  user's sign-off before breaking it.
