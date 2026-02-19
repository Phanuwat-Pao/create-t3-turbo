# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm i                    # Install dependencies
pnpm dev                  # Run all apps in development mode (turbo watch)
pnpm dev:next             # Run only Next.js app and dependencies
pnpm build                # Build all packages and apps
pnpm typecheck            # Run TypeScript checks (uses tsgo - native TypeScript)
pnpm check                # Check linting and formatting with Ultracite (oxlint + oxfmt)
pnpm check:fix            # Auto-fix linting and formatting issues

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

- **nextjs**: Next.js 16 web app with App Router, React 19, Tailwind CSS v4
- **expo**: React Native app with Expo SDK 54, Expo Router, NativeWind v5
- **tanstack-start**: TanStack Start v1 (rc) web app alternative

### Shared Packages (`packages/`)

- **api** (`@acme/api`): oRPC router - exports `appRouter`, `createContext`, procedure helpers
- **auth** (`@acme/auth`): Better Auth configuration with Discord OAuth, Expo support, and OAuth proxy plugin
- **db** (`@acme/db`): Drizzle ORM with Vercel Postgres (edge-compatible). Exports:
  - `@acme/db/client` - database client instance
  - `@acme/db/schema` - Drizzle schema definitions
- **ui** (`@acme/ui`): shadcn/ui components. Import individual components: `@acme/ui/button`
- **validators** (`@acme/validators`): Shared Zod schemas for client/server validation

### Tooling (`tooling/`)

- **tailwind**: Shared Tailwind CSS theme
- **typescript**: Shared tsconfig bases

### Code Quality Tools

- **Ultracite**: Zero-config preset wrapping oxlint (linter) + oxfmt (formatter)
- **@typescript/native-preview**: Go-based native TypeScript compiler (`tsgo`) for ~10x faster type checking

## Key Patterns

### oRPC Setup

- Routers defined in `packages/api/src/router/`
- Root router in `packages/api/src/root.ts`
- Context and procedures in `packages/api/src/orpc.ts`
- Use `publicProcedure` for unauthenticated endpoints, `protectedProcedure` for authenticated
- In Next.js: `orpc` from `~/rpc/server` for RSC, `orpc` from `~/rpc/react` for client components
- API endpoint at `/api/rpc/[[...rest]]/route.ts` using `RPCHandler`

### oRPC with React Query

Pass `enabled` and other query options directly inside `queryOptions()`, not spread outside:

```tsx
// ✅ Correct - pass enabled inside queryOptions
const { data, isLoading } = useQuery(
  orpc.patrol.getSession.queryOptions({
    enabled: Boolean(sessionId),
    input: { sessionId: sessionId ?? "" },
  })
);

// ❌ Wrong - don't spread and add enabled outside
const { data, isLoading } = useQuery({
  ...orpc.patrol.getSession.queryOptions({
    input: { sessionId: sessionId ?? "" },
  }),
  enabled: Boolean(sessionId),
});
```

Similarly for `useMutation`, pass callbacks inside `mutationOptions()`:

```tsx
// ✅ Correct - pass callbacks inside mutationOptions
const setActiveMutation = useMutation(
  orpc.team.setActive.mutationOptions({
    onError: (error) => {
      Alert.alert(t("common.error"), error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.replace("/(tabs)");
    },
  })
);

// ❌ Wrong - don't spread and add callbacks outside
const setActiveMutation = useMutation({
  ...orpc.team.setActive.mutationOptions(),
  onError: (error) => {
    Alert.alert(t("common.error"), error.message);
  },
  onSuccess: () => {
    queryClient.invalidateQueries();
    router.replace("/(tabs)");
  },
});
```

### Database Schema

- Define tables in `packages/db/src/schema.ts` using Drizzle's `pgTable`
- Use `drizzle-zod` `createInsertSchema` for validation schemas
- Auth tables auto-generated in `packages/db/src/auth-schema.ts`

### Environment Variables

- Copy `.env.example` to `.env` at root
- Required: `POSTGRES_URL`, `AUTH_SECRET`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
- Apps use `dotenv -e ../../.env --` (via `with-env` script) to load root `.env`

### Next.js Proxy (replaces Middleware)

Next.js 16 replaces `middleware.ts` with `proxy.ts`. The proxy runs on the Node.js runtime (not edge).

- Proxy file at `apps/nextjs/src/proxy.ts` - handles locale detection, session validation, and route protection
- Export a named `proxy` function (not `middleware`), with a `config` object for `matcher`
- Config flags use `proxy` naming: `skipProxyUrlNormalize` (not `skipMiddlewareUrlNormalize`)
- Uses `NextRequest`/`NextResponse` from `next/server` (same API as before)
- To migrate: rename `middleware.ts` → `proxy.ts`, rename export `middleware` → `proxy`, or run `npx @next/codemod@latest middleware-to-proxy .`

### Adding oRPC Procedures

1. Create/edit router file in `packages/api/src/router/`
2. Add router to `packages/api/src/root.ts`
3. Input validation with Zod, use `@acme/validators` for shared schemas
4. Use `.handler(({ context, input }) => ...)` pattern for procedure handlers

## CI

GitHub Actions runs `check` (ultracite) and `typecheck` (tsgo) on PRs and pushes to main.

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Fix issues**: `pnpm check:fix`
- **Check for issues**: `pnpm check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Oxlint + Oxfmt (the underlying engines) provide robust linting and formatting. Most issues are automatically fixable.

---

## Lint Rules

- **Never add `eslint-disable`, `oxlint-ignore`, or similar comments to suppress lint warnings/errors**
- **Never add or modify lint configuration to disable rules**
- Always fix the underlying code to satisfy the lint rule

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js 16:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components
- Use `proxy.ts` (not `middleware.ts`) — export a named `proxy` function, runs on Node.js runtime

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `pnpm check:fix` before committing to ensure compliance.
