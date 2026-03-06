import { publicProcedure } from "@acme/api/procedures";
import { sql } from "@acme/db";

function buildHealthResponse(check: "liveness" | "readiness") {
  return {
    check,
    status: "ok" as const,
    timestamp: new Date().toISOString(),
  };
}

export default {
  liveness: publicProcedure
    .route({
      method: "GET",
      path: "/liveness",
    })
    .handler(() => buildHealthResponse("liveness")),

  readiness: publicProcedure
    .route({
      method: "GET",
      path: "/readiness",
    })
    .handler(async ({ context }) => {
      await context.db.execute(sql`select 1`);
      return buildHealthResponse("readiness");
    }),
};
