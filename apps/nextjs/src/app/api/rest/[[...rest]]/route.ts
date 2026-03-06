import { appRouter, createContext } from "@acme/api";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { CompressionPlugin } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";

import { auth } from "~/auth/server";
import origins from "~/config/origin";

function logError(error: unknown) {
  console.error(error);
}

const handler = new OpenAPIHandler(appRouter, {
  interceptors: [onError(logError)],
  plugins: [
    new CORSPlugin({
      credentials: true,
      exposeHeaders: ["Content-Disposition"],
      origin: origins,
    }),
    new CompressionPlugin(),
  ],
});

async function handleRequest(request: Request) {
  const context = await createContext({
    auth: auth as Parameters<typeof createContext>[0]["auth"],
    headers: request.headers,
  });
  // Provide initial context if needed
  const { response } = await handler.handle(request, {
    context,
    prefix: `/api/rest`,
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
