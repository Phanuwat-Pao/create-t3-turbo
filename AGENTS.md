# Repository Guidelines

## Project Structure & Module Organization
This repo is a `pnpm` + Turborepo monorepo.
- `apps/nextjs`: Next.js web app (App Router) under `src/`.
- `apps/expo`: Expo mobile app under `src/`.
- `packages/api`: shared API/router layer.
- `packages/auth`: Better Auth runtime config and schema generator script.
- `packages/db`: Drizzle schema/client and database tooling.
- `packages/ui`: shared UI components.
- `packages/validators`: shared validation utilities.
- `tooling/*`: shared config packages (TypeScript, Tailwind, GitHub actions setup).

Keep new code in each workspace’s `src/` directory and group files by feature where possible.

## Build, Test, and Development Commands
- `pnpm i`: install all workspace dependencies.
- `pnpm dev`: run all development tasks in watch mode via Turbo.
- `pnpm dev:next`: run only the Next.js app and its dependencies.
- `pnpm build`: build all workspaces.
- `pnpm typecheck`: run `tsgo --noEmit` checks across workspaces.
- `pnpm check`: run Ultracite checks (format + lint verification).
- `pnpm check:fix`: auto-fix formatting/lint issues with Ultracite.
- `pnpm db:push`: push Drizzle schema changes to the configured database.
- `pnpm auth:generate`: regenerate Better Auth schema after auth model updates.

## Coding Style & Naming Conventions
Use TypeScript throughout, with 2-space indentation and semicolons.
- File names: kebab-case (example: `sign-in-form.tsx`).
- React components/types: PascalCase.
- Variables/functions: camelCase.
- Prefer explicit types for public/shared APIs.
- Prefer `const`, early returns, optional chaining, and `for...of` loops.

Run `pnpm check:fix` before opening a PR. Ultracite (Oxlint + Oxfmt) is the source of truth.

## Testing Guidelines
There is currently no dedicated unit-test runner configured in CI. Quality gates are:
- `pnpm lint:ws`
- `pnpm check:fix`
- `pnpm typecheck`

For behavior changes, include clear manual verification steps in your PR. If you add tests, use `*.test.ts` or `*.test.tsx` and colocate them with the source.

## Commit & Pull Request Guidelines
Follow the existing Conventional Commit pattern from history (for example: `feat: ...`, `fix: ...`, `refactor: ...`, `chore: ...`). Keep each commit scoped to one logical change.

PRs should include:
- what changed and why
- affected app/package paths (example: `apps/nextjs`, `packages/db`)
- linked issue/ticket when applicable
- migration notes for `.env`, schema, or auth changes
- screenshots/video for UI changes
