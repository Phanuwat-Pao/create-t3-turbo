import { appRouter } from "@acme/api";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { ApiReference } from "@scalar/nextjs-api-reference";

import { auth } from "~/auth/server";
import { getBaseUrl } from "~/config/base-url";

// Deliberately not `force-static`: `auth.api.*` initialises Better Auth, and
// since 1.7 the OAuth provider plugin seeds its `oauth_resource` rows during
// init. Prerendering this route at build time would therefore need a live
// database, which the Docker build does not have. Generate once per server
// process on the first request instead.
let handlerPromise: Promise<() => Response> | undefined;

async function createHandler(): Promise<() => Response> {
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

  return ApiReference({
    cdn: "/api/cdn/scalar",
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
  });
}

export async function GET() {
  handlerPromise ??= createHandler();
  try {
    const handler = await handlerPromise;
    return handler();
  } catch (error) {
    // Let the next request retry instead of caching a failed attempt.
    handlerPromise = undefined;
    throw error;
  }
}
