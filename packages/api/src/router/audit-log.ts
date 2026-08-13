import { protectedProcedure } from "@acme/api/procedures";
import { ORPCError } from "@orpc/server";
import { z } from "zod/v4";

export default {
  list: protectedProcedure
    .route({
      method: "GET",
      path: "/list",
    })
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .handler(({ context, input }) => {
      if (context.session.user.role !== "admin") {
        throw new ORPCError("FORBIDDEN");
      }
      return context.db.query.AuditLog.findMany({
        limit: input.limit,
        offset: input.offset,
        orderBy: { createdAt: "desc" },
        with: { user: true },
      });
    }),
};
