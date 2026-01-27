import { appRouter } from "@acme/api";
// app/reference/route.ts
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { ApiReference } from "@scalar/nextjs-api-reference";

import { auth } from "~/auth/server";
import { getBaseUrl } from "~/config/base-url";

export const dynamic = "force-static";

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});
const spec = await generator.generate(appRouter, {
  info: {
    title: "Acme API",
    version: "1.0.0",
  },
  servers: [
    {
      url: `${getBaseUrl()}/api/rest`,
    },
  ],
});

const authSwagger = await auth.api.generateOpenAPISchema();

const config = {
  cdn: `/api/cdn/scalar`,
  sources: [
    {
      content: authSwagger,
      title: "Better Auth",
    },
    {
      content: spec,
      title: "Nextjs API",
    },
  ],
} satisfies Parameters<typeof ApiReference>[0];
export const GET = ApiReference(config);
