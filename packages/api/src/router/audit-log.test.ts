/* eslint-disable jest/no-hooks, jest/require-hook, promise/prefer-await-to-callbacks */
import { call } from "@orpc/server";

import type { Context } from "../orpc";
import auditLogRouter from "./audit-log";

function createContext(options: {
  findMany?: ReturnType<typeof vi.fn>;
  role?: string;
  userId?: string;
}): Context {
  // protectedProcedure runs handlers inside db.transaction, so the mock
  // transaction hands the handler this same db object as the tx.
  const db = {
    query: {
      AuditLog: {
        findMany: options.findMany ?? vi.fn(),
      },
    },
    transaction: async (callback: (tx: Context["db"]) => Promise<unknown>) =>
      callback(db as unknown as Context["db"]),
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

describe("auditLog router", () => {
  it("rejects unauthenticated callers", async () => {
    await expect(
      call(
        auditLogRouter.list,
        { limit: 50, offset: 0 },
        {
          context: createContext({}),
        }
      )
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects authenticated non-admin users", async () => {
    const findMany = vi.fn();

    await expect(
      call(
        auditLogRouter.list,
        { limit: 50, offset: 0 },
        {
          context: createContext({
            findMany,
            role: "user",
            userId: "user_123",
          }),
        }
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    expect(findMany).not.toHaveBeenCalled();
  });

  it("returns newest-first audit rows for admins", async () => {
    const rows = [
      {
        action: "user_signed_in",
        createdAt: new Date("2026-08-13T00:00:00Z"),
        id: "log_1",
        user: { id: "user_123", name: "Admin" },
      },
    ];
    const findMany = vi.fn().mockResolvedValue(rows);

    const result = await call(
      auditLogRouter.list,
      { limit: 10, offset: 0 },
      {
        context: createContext({ findMany, role: "admin", userId: "user_123" }),
      }
    );

    expect(result).toEqual(rows);
    expect(findMany).toHaveBeenCalledWith({
      limit: 10,
      offset: 0,
      orderBy: { createdAt: "desc" },
      with: { user: true },
    });
  });
});
