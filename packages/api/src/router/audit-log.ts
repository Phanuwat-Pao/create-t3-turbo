import { protectedProcedure } from "@acme/api/procedures";
import { asc, count, eq, type SQL, type SQLWrapper, sql } from "@acme/db";
import { AuditLog, user } from "@acme/db/schema";
import { AuditLogPageInput, type AuditLogSort } from "@acme/validators/admin";
import { pageOffset } from "@acme/validators/paging";
import { ORPCError } from "@orpc/server";

import { matchesSearch } from "../paging";

/** What each sortable column sorts by. */
const SORT_BY: Record<AuditLogSort, SQLWrapper> = {
  action: AuditLog.action,
  createdAt: AuditLog.createdAt,
  ipAddress: AuditLog.ipAddress,
  user: user.name,
};

/** What the search box looks in; metadata and user agent are left out. */
const SEARCHED = [AuditLog.action, AuditLog.ipAddress, user.name, user.email];

export default {
  /** One page of the audit log, searched and sorted on the server. */
  list: protectedProcedure
    .route({
      method: "GET",
      path: "/list",
    })
    .input(AuditLogPageInput)
    .handler(async ({ context, input }) => {
      if (context.session.user.role !== "admin") {
        throw new ORPCError("FORBIDDEN");
      }
      const where: SQL | undefined = matchesSearch(SEARCHED, input.search);
      const [counted] = await context.db
        .select({ total: count() })
        .from(AuditLog)
        .leftJoin(user, eq(user.id, AuditLog.userId))
        .where(where);
      // Rows without a value (no IP, a deleted user) sort last either way.
      const sortBy = input.sort.desc
        ? sql`${SORT_BY[input.sort.id]} desc nulls last`
        : sql`${SORT_BY[input.sort.id]} asc nulls last`;
      const rows = await context.db
        .select({
          action: AuditLog.action,
          createdAt: AuditLog.createdAt,
          id: AuditLog.id,
          ipAddress: AuditLog.ipAddress,
          user: { email: user.email, id: user.id, name: user.name },
        })
        .from(AuditLog)
        .leftJoin(user, eq(user.id, AuditLog.userId))
        .where(where)
        // The id breaks ties, so rows never move between pages.
        .orderBy(sortBy, asc(AuditLog.id))
        .limit(input.pageSize)
        .offset(pageOffset(input));
      return { rows, total: counted?.total ?? 0 };
    }),
};
