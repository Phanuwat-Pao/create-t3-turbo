import { PgDialect } from "@acme/db";
import { call } from "@orpc/server";

import type { Context } from "../orpc";
import auditLogRouter from "./audit-log";

const dialect = new PgDialect();

interface Recorded {
  limit?: number;
  offset?: number;
  orderBy?: unknown[];
  where?: unknown;
}

/**
 * A stand-in for drizzle's select builder: every query resolves to the next
 * result in `results`, and the last query's clauses are recorded.
 */
function fakeSelect(results: unknown[][]) {
  const queries: Recorded[] = [];
  const select = vi.fn(() => {
    const recorded: Recorded = {};
    queries.push(recorded);
    const result = results[queries.length - 1] ?? [];
    const chain = {
      from: () => chain,
      leftJoin: () => chain,
      limit: (value: number) => {
        recorded.limit = value;
        return chain;
      },
      offset: (value: number) => {
        recorded.offset = value;
        return chain;
      },
      orderBy: (...args: unknown[]) => {
        recorded.orderBy = args;
        return chain;
      },
      // oxlint-disable-next-line unicorn/no-thenable -- drizzle builders are awaited
      then: (resolve: (value: unknown) => unknown) => resolve(result),
      where: (value: unknown) => {
        recorded.where = value;
        return chain;
      },
    };
    return chain;
  });
  return { queries, select };
}

function createContext(options: {
  select?: ReturnType<typeof vi.fn>;
  role?: string;
  userId?: string;
}): Context {
  // protectedProcedure runs handlers inside db.transaction, so the mock
  // transaction hands the handler this same db object as the tx.
  const db = {
    select: options.select ?? vi.fn(),
    transaction: async (run: (tx: Context["db"]) => Promise<unknown>) =>
      run(db as unknown as Context["db"]),
  };

  return {
    authApi: {} as Context["authApi"],
    db: db as unknown as Context["db"],
    s3: {} as Context["s3"],
    session: options.userId
      ? ({
          user: { id: options.userId, role: options.role },
        } as NonNullable<Context["session"]>)
      : null,
  };
}

const toSql = (value: unknown) =>
  dialect.sqlToQuery(value as Parameters<typeof dialect.sqlToQuery>[0]);

describe("auditLog router", () => {
  it("rejects unauthenticated callers", async () => {
    await expect(
      call(auditLogRouter.list, {}, { context: createContext({}) })
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects authenticated non-admin users", async () => {
    const select = vi.fn();

    await expect(
      call(
        auditLogRouter.list,
        {},
        {
          context: createContext({ role: "user", select, userId: "user_123" }),
        }
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    expect(select).not.toHaveBeenCalled();
  });

  it("returns one newest-first page and the total for admins", async () => {
    const rows = [
      {
        action: "user_signed_in",
        createdAt: new Date("2026-08-13T00:00:00Z"),
        id: "log_1",
        ipAddress: null,
        user: { email: "admin@example.com", id: "user_123", name: "Admin" },
      },
    ];
    const { queries, select } = fakeSelect([[{ total: 31 }], rows]);

    const result = await call(
      auditLogRouter.list,
      { page: 2, pageSize: 10 },
      {
        context: createContext({ role: "admin", select, userId: "user_123" }),
      }
    );

    expect(result).toEqual({ rows, total: 31 });
    const [counted, page] = queries;
    expect(counted?.where).toBeUndefined();
    expect(page).toMatchObject({ limit: 10, offset: 10 });
    expect(page?.orderBy?.map((part) => toSql(part).sql)).toEqual([
      '"audit_log"."created_at" desc nulls last',
      '"audit_log"."id" asc',
    ]);
  });

  it("searches and sorts on the server", async () => {
    const { queries, select } = fakeSelect([[{ total: 0 }], []]);

    await call(
      auditLogRouter.list,
      { search: "alice", sort: { desc: false, id: "user" } },
      {
        context: createContext({ role: "admin", select, userId: "user_123" }),
      }
    );

    const [counted, page] = queries;
    expect(toSql(counted?.where).params).toEqual([
      "%alice%",
      "%alice%",
      "%alice%",
      "%alice%",
    ]);
    expect(page?.where).toBe(counted?.where);
    expect(toSql(page?.orderBy?.[0]).sql).toBe('"user"."name" asc nulls last');
    expect(page).toMatchObject({ limit: 25, offset: 0 });
  });
});
