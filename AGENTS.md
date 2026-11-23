# create-t3-turbo

A pnpm + Turborepo monorepo built on the T3 stack: a Next.js 16 web app and an
Expo SDK 58 mobile app sharing one typed oRPC API, one Drizzle v1 Postgres
schema, and one Better Auth setup.

## What makes this repo special?

This is a template-grade codebase: it exists to demonstrate the current best
version of this stack. Two standing policies follow from that:

1. **Always latest.** Dependencies are kept at the absolute latest, including
   major bumps and prerelease lines already adopted (Drizzle v1 RC). Shared
   versions live in the `catalog:` section of `pnpm-workspace.yaml`;
   security floors for transitive deps live in its `overrides:` block.
2. **The gates are the product.** Every commit must pass the full lefthook
   pre-commit suite. Fixing the blocker is the job; bypassing the gate is not.

## A small glossary

- **you** means the agent reading this file and changing this repo.
- **user** means the developer directing you.
- **catalog** means the shared dependency versions in `pnpm-workspace.yaml`;
  workspace `package.json`s reference them as `catalog:` / `catalog:react19`.
- **gate** means a lefthook pre-commit job. All must pass for a commit to land.
- **generated schema** means `packages/db/src/auth-schema.ts`, written by
  `pnpm auth:generate`. Never edited by hand.

## The ways to hurt yourself

1. **Bypassing git hooks.** Never `git commit --no-verify` (or `-n`). The
   pre-commit suite is: `check:fix` (repo-wide format+lint with
   `stage_fixed: true`), then parallel `audit-critical`, `typecheck`,
   `lint:ws` (sherif), `build`, and `timestamptz` (fails on any Drizzle
   `timestamp` column without a time zone; `pnpm -F @acme/db
   check:timestamptz`). The audit takes ~10 minutes. Accept it.
   If a gate fails, fix the cause and commit again through the hooks.
2. **Hand-editing generated auth schema.** `packages/db/src/auth-schema.ts`
   comes from `pnpm auth:generate` (the `auth` CLI package; the old
   `@better-auth/cli` is deprecated, stuck at 1.4, and generates a schema
   that no longer matches Better Auth 1.7). Change auth config in
   `packages/auth/src/index.ts`, then regenerate. Two post-regen fixups this
   repo maintains (re-apply them after every regen): strip the drizzle-v0
   `relations()` blocks the CLI emits (relations live in `relations.ts` via
   `defineRelations`), and add `{ withTimezone: true }` to every
   `timestamp(...)` column. This repo's columns are `timestamptz`, while the
   CLI emits plain `timestamp`. The `timestamptz` gate blocks the commit if
   that second fixup is missed.
3. **Pushing schema at the wrong database.** `pnpm db:push` applies
   `packages/db/src/schema.ts` directly to `POSTGRES_URL` from `.env` (it
   swaps port 6543 → 5432 for the non-pooling connection). Know which
   database `.env` points at before running it.
4. **Desyncing the Expo deep-link scheme.** `scheme` in
   `apps/expo/app.config.ts` and the mobile origin in `trustedOrigins`
   (`packages/auth/src/index.ts`) must match: the session cookie is redirected
   to that scheme after mobile OAuth. Keep it app-specific. The `expo()`
   plugin already trusts the broad `exp://` scheme in development only, and a
   generic scheme trusted in production could hand the session to a deep link
   this app does not control. Renaming it also means updating the callback
   URLs registered with each OAuth provider.
5. **Fighting the toolchain by hand.** Ultracite (oxlint + oxfmt) is the
   source of truth for style and will rewrite files repo-wide during commit.
   Don't hand-format; run `pnpm check:fix`. When a rule is genuinely wrong
   for a site, use the narrowest suppression and say why:
   `// oxlint-disable-next-line <rule> -- <why>`. A suppression without a
   reason fails lint (`acme/require-suppression-reason`). Rule-level opt-outs
   go in `oxlint.config.ts` with a comment (see the existing ones for the
   pattern).
6. **Killing by pattern.** Never `pkill -f`, `pgrep | kill`, or kill a PID
   you found by matching a name or path. Your own agent shell has this
   checkout's path in its argv, and the machine may run other projects' dev
   servers at the same time. Kill only a PID you captured at spawn, or the
   owner of your port from `ss -H -ltnp` after confirming `/proc/<pid>/cwd`
   is inside your checkout.

## Hit every surface

A change that works where you tested it and is missing everywhere else is the
most common defect. Before calling work done, walk this list:

- **Apps.** `apps/nextjs` (web) and `apps/expo` (mobile) share the API, auth,
  and validators. A feature that touches shared packages needs a decision for
  both apps, even if the decision is "web only".
- **Reverse states.** If you added a way in, add the way out and a way to see
  it. Ban needs unban, invite needs cancel, enabling 2FA needs disabling it.
  A one-way door is a bug.
- **Catalogs.** A dependency shared by more than one workspace belongs in the
  catalog, not duplicated. `sherif` runs on postinstall and fails the install
  on version drift across workspaces.
- **Auth surface.** Auth changes ripple: `packages/auth` config →
  `pnpm auth:generate` → `packages/db/src/auth-schema.ts` →
  `packages/db/src/relations.ts` → both app clients.
- **i18n.** Both apps use i18next with one `translation` namespace and
  `en`/`th` resources. The web app's live in `apps/nextjs/src/i18n/*.json`
  behind next-i18next (`[lang]` routes): Server Components and
  `generateMetadata` call `getT()` from `~/i18n/server`, Client Components
  call `useTranslation()` from react-i18next. Keep `en.json` and `th.json`
  key-for-key; the web client only receives the current language, and a
  test enforces the parity. The browser reads that language from its own
  file, `/i18n/<lng>.translation.<hash>.json` (`~/i18n/translation-files`,
  `app/i18n/[file]/route.ts`), which it keeps for a year; the root layout
  preloads it and `~/i18n/translations-provider` hands it to next-i18next's
  `I18nProvider`. Never pass `resources` from a layout: they ride inside the
  RSC payload of every hard load and every `router.refresh()`. User-visible strings need entries in both apps
  where they appear. No em dashes in copy or comments; `acme/no-em-dash`
  fails lint on them in code.
- **Locale in every in-app URL.** Links come from `~/components/link` (lint
  rejects `next/link`), client navigations go through
  `withLocale(path, useLocale())`, server redirects through
  `localizedRedirect(path)`, and Better Auth `callbackURL`/`redirectTo`
  values are localized before they leave the client. A locale-less path
  still works via the proxy's redirect, but Next's segment prefetches break
  on it and every click pays a second hop;
  `apps/e2e/src/tests/locale-links.test.ts` guards it.
- **Env.** New environment variables go through the t3-env definitions
  (`apps/nextjs/src/env.ts`, `packages/auth/env.ts`) and `turbo.json`'s
  `globalEnv` when tasks depend on them.
- **SEO.** A new public page needs `generateMetadata` built with
  `pageMetadata` from `~/lib/metadata`, its path added to `PUBLIC_PATHS` so
  the sitemap and hreflang alternates pick it up, and `seo.*` strings in
  both locale files. `pageMetadata` sets `openGraph`, which replaces the
  parent's object along with the image from `[lang]/opengraph-image`, so
  the page's folder also needs an `opengraph-image.tsx` that re-exports that
  one (see `pricing/`); `seo.test.ts` walks the sitemap and fails on a page
  without it. Anything behind a session or mid-flow (auth steps,
  OAuth consent, device codes) exports `robots: NOINDEX` instead; a
  `"use client"` page cannot export metadata, so give its folder a layout
  that does. Never hard-code a domain: `getSiteUrl()` reads the request's
  forwarded host so www and bare hosts each get self-consistent URLs.

## Dev servers and worktrees

- `pnpm dev` watches everything except Expo; `pnpm dev:next` watches the web
  app and the packages it uses. Next.js takes port 3000 and moves to the next
  free port when another checkout holds it, so read the URL from its output.
- Run dev servers from your own shell so they end with your session. Do not
  detach them with `nohup`, `setsid`, `tmux`, or `systemd-run` unless the
  user asks for one that outlives the session. Stop what you started by the
  PID you tracked (rule 6), then confirm with `ss -H -ltnp` that the port is
  free.
- In T3 Code, `t3.json` prepares new worktrees: it links the main checkout's
  `.env` and runs `pnpm install --frozen-lockfile` before the agent starts.
  When the thread settles, it deletes `apps/nextjs/.next` and `.turbo`, which
  reach gigabytes. A worktree without `node_modules` never ran that setup;
  run `pnpm i` yourself.
- Need a second checkout? `git worktree add` it next to this repo, not in
  `/tmp`. pnpm cannot hardlink across filesystems, so a worktree on another
  one copies every package. Remove it when done.

## Where code lives

- `apps/nextjs` holds Next.js 16 App Router under `src/`, React 19 + React
  Compiler, Tailwind CSS 4, oRPC client + TanStack Query/Form, Better Auth
  client, presigned-S3 storage helpers.
- `apps/expo` holds Expo SDK 58 (expo-router, React Native 0.88, uniwind)
  under `src/`. Ships OTA updates through EAS Update: the `fingerprint`
  runtime policy, update URL and `owner` live in `app.config.ts`, channels in
  `eas.json`, and `src/hooks/use-ota-updates.ts` applies a downloaded update.
- `apps/e2e` holds the Playwright end-to-end tests.
- `packages/api` holds the oRPC router, context, and the S3 service
  (`src/s3.ts`; AWS interaction stays isolated here).
- `packages/auth` holds the Better Auth runtime config (`initAuth`) and the
  schema generator script.
- `packages/db` holds Drizzle ORM v1 (RC line): `schema.ts` uses a snake_case
  `pgTableCreator`; relations use the v2 relational API (`defineRelations`)
  in `relations.ts`; client in `client.ts`.
- `packages/ui` holds the shared shadcn/radix components. Add new ones with
  `pnpm ui-add`, not by hand-copying.
- `packages/validators` holds shared Zod schemas and helpers.
- `tooling/*` holds shared TypeScript and Tailwind config, and
  `tooling/oxlint-plugin`, this repo's own lint rules (`acme/*`).
- `scripts/` holds the T3 Code worktree scripts that `t3.json` runs.

Keep new code in each workspace's `src/` and group files by feature.

## Build, test, and development commands

- `pnpm i` installs (runs sherif via postinstall).
- `pnpm dev` / `pnpm dev:next` start watch mode (see Dev servers).
- `pnpm build` builds all workspaces.
- `pnpm typecheck` runs `tsc --noEmit` (TypeScript 7, the native compiler)
  everywhere.
- `pnpm check` / `pnpm check:fix` run Ultracite lint+format verify / auto-fix.
- `pnpm -F <workspace> test` runs Vitest for `@acme/api`, `@acme/nextjs`,
  `@acme/validators`, `@acme/oxlint-plugin` (globals enabled via each
  `vitest.config.ts`).
- `pnpm e2e` runs the Playwright suite (`pnpm e2e:install` once for browsers).
- `pnpm db:push` / `pnpm db:studio` run Drizzle Kit against `.env`.
- `pnpm auth:generate` regenerates the Better Auth schema.
- `pnpm ui-add` adds a shadcn component to `packages/ui`.

## Verifying

Smallest proof first: run the tests for what you touched and typecheck the
scope you changed. Escalate to `pnpm build` when a change could break page
data collection (auth config, env, route handlers; these execute at build
time). Tests colocate with source as `*.test.ts`; suites exist in
`packages/validators`, `packages/api`, `apps/nextjs`, and
`tooling/oxlint-plugin`. Behavior changes in those areas ship with focused
tests. The pre-commit gate re-runs typecheck, lint, and build anyway;
arriving at commit time already green keeps the ~10-minute audit the only
wait.

- Test behavior that can break: auth and permission guards, callback and
  redirect handling, persistence, parsing of outside formats, and the logic a
  bug fix changed. Leave out tests for what types already guarantee, copy
  text, and mock-call mirrors.
- Extend before you add. When an existing test or table covers the behavior,
  add a row or an assertion there.
- Test at one layer: the lowest one that fails without your change. Do not
  repeat the case in a wrapper test or at each call site.
- Proof for a bug fix depends on the bug. Logic, data, and protocol bugs get
  a test that fails before the fix. Purely visual bugs (spacing, color, a
  layout shift) get before/after screenshots and no test.

## Coding style & naming conventions

TypeScript throughout; 2-space indent; semicolons. Files kebab-case
(`sign-in-form.tsx`); components/types PascalCase; variables/functions
camelCase. Prefer inferred types locally and explicit types on shared/public
APIs. Prefer `const`, early returns, optional chaining, and `for...of`.
The formatter prefers arrow callbacks and sorted keys. Let it win.

React specifics: the React Compiler is enabled, and its lint rule is
error-level. Don't fight it. Avoid setState-in-effect (use
`useSyncExternalStore` for external stores like media queries; see
`packages/ui/hooks/use-mobile.ts`), don't read or write refs during render,
and skip manual `useCallback`/`useMemo` where the compiler flags it.

## Commit & pull request guidelines

Conventional Commits in plain language (`feat:`, `fix:`, `chore:`,
`refactor:`), one logical change per commit, committed through the hooks.
PR bodies state the problem in a sentence or two, then how you fixed it.
Include the affected workspaces (`apps/nextjs`, `packages/db`, …), migration
notes for `.env`/schema/auth changes, and screenshots or video for UI
changes. Never open a PR unless the user asks. Never commit implementation
plans, research notes, or agent scratch files; keep them outside the repo.

## Taste

- Complexity belongs at the boundaries (adapters, services like `s3.ts`);
  routers stay thin, UI stays dumb.
- `packages/ui` components own their look. Pick a `variant` or `size`
  instead of restyling one with `className`; layout classes (width, margin,
  flex, position) are fine. If no variant fits and the look is generic, add
  a variant to the component.
- Fight scope creep; honor the user's intent minimally and realistically.
- Comments carry what the code can't show: a constraint, an outside quirk,
  an invariant, or how a thing is meant to be used. Don't narrate steps or
  record history; the commit carries that. Comments move when the code moves.
- If a rule here fights the task in front of you, say so loudly and get the
  user's sign-off before breaking it.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
