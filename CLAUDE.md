# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm i                    # Install dependencies
pnpm dev                  # Run all apps in development mode (turbo watch)
pnpm dev:next             # Run only Next.js app and dependencies
pnpm build                # Build all packages and apps
pnpm typecheck            # Run TypeScript checks across all packages
pnpm lint                 # Run ESLint across all packages
pnpm lint:fix             # Run ESLint with auto-fix
pnpm format               # Check formatting with Prettier
pnpm format:fix           # Fix formatting with Prettier

# Database
pnpm db:push              # Push Drizzle schema to database
pnpm db:studio            # Open Drizzle Studio

# Auth
pnpm auth:generate        # Generate Better Auth schema to packages/db/src/auth-schema.ts

# UI
pnpm ui-add               # Add shadcn/ui components interactively

# New package
pnpm turbo gen init       # Generate a new package with tooling configured
```

## Architecture

This is a T3 Stack monorepo using Turborepo with pnpm workspaces. Package names use the `@acme` prefix.

### Apps (`apps/`)
- **nextjs**: Next.js 15 web app with App Router, React 19, Tailwind CSS v4
- **expo**: React Native app with Expo SDK 54, Expo Router, NativeWind v5
- **tanstack-start**: TanStack Start v1 (rc) web app alternative

### Shared Packages (`packages/`)
- **api** (`@acme/api`): tRPC v11 router - exports `appRouter`, `createTRPCContext`, procedure helpers
- **auth** (`@acme/auth`): Better Auth configuration with Discord OAuth, Expo support, and OAuth proxy plugin
- **db** (`@acme/db`): Drizzle ORM with Vercel Postgres (edge-compatible). Exports:
  - `@acme/db/client` - database client instance
  - `@acme/db/schema` - Drizzle schema definitions
- **ui** (`@acme/ui`): shadcn/ui components. Import individual components: `@acme/ui/button`
- **validators** (`@acme/validators`): Shared Zod schemas for client/server validation

### Tooling (`tooling/`)
- **eslint**: Shared ESLint configs
- **prettier**: Shared Prettier config
- **tailwind**: Shared Tailwind CSS theme
- **typescript**: Shared tsconfig bases

## Key Patterns

### tRPC Setup
- Routers defined in `packages/api/src/router/`
- Root router in `packages/api/src/root.ts`
- Context and procedures in `packages/api/src/trpc.ts`
- Use `publicProcedure` for unauthenticated endpoints, `protectedProcedure` for authenticated
- In Next.js: `trpc` from `~/trpc/server` for RSC, `useTRPC` from `~/trpc/react` for client components

### Database Schema
- Define tables in `packages/db/src/schema.ts` using Drizzle's `pgTable`
- Use `drizzle-zod` `createInsertSchema` for validation schemas
- Auth tables auto-generated in `packages/db/src/auth-schema.ts`

### Environment Variables
- Copy `.env.example` to `.env` at root
- Required: `POSTGRES_URL`, `AUTH_SECRET`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
- Apps use `dotenv -e ../../.env --` (via `with-env` script) to load root `.env`

### Adding tRPC Procedures
1. Create/edit router file in `packages/api/src/router/`
2. Add router to `packages/api/src/root.ts`
3. Input validation with Zod, use `@acme/validators` for shared schemas

## CI

GitHub Actions runs lint, format, and typecheck on PRs and pushes to main.
