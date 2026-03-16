import type { Auth, AuthApi, Session } from "@acme/auth";
import { type Database, db } from "@acme/db/client";
/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the oRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { ORPCError, os } from "@orpc/server";

import { createS3Service, type S3Service } from "./s3";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for an oRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://orpc.dev/docs/context
 */

export interface Context {
  authApi: AuthApi;
  session: Session | null;
  db: Database;
  s3: S3Service;
}

export async function createContext(opts: {
  headers: Headers;
  auth: Auth;
  s3?: S3Service;
}): Promise<Context> {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({
    headers: opts.headers,
  });
  return {
    authApi,
    db,
    s3: opts.s3 ?? createS3Service(),
    session,
  };
}

/**
 * 2. INITIALIZATION
 *
 * This is where the oRPC api is initialized with context typing.
 * oRPC handles serialization internally (Dates, Maps, Sets, etc.)
 */
export const o = os.$context<Context>();
const base = o;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your oRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * Middleware for timing procedure execution.
 */
const withTiming = base.use(async ({ context, next, path }) => {
  const start = Date.now();
  const result = await next({ context });
  const end = Date.now();
  console.log(`[ORPC] ${path.join(".")} took ${end - start}ms to execute`);
  return result;
});

export const withTransaction = withTiming.use(async ({ context, next }) =>
  context.db.transaction(async (tx) =>
    next({
      context: { ...context, db: tx },
    })
  )
);

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * oRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = withTiming;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `context.session.user` is not null.
 *
 * @see https://orpc.dev/docs/middleware
 */
export const protectedProcedure = withTransaction.use(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      // infers the `session` as non-nullable
      session: { ...context.session, user: context.session.user },
    },
  });
});

// Re-export ORPCError for use in client-side error handling
export { ORPCError };
