import { appRouter, createContext } from "@acme/api";
import { onError } from "@orpc/server";
import { CompressionPlugin, RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";

import { auth } from "~/auth/server";
import origins from "~/config/origin";
import { s3 } from "~/server/s3";
function logError(error: unknown) {
  console.error(">>> oRPC Error:", error);
}

const handler = new RPCHandler(appRouter, {
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
    s3,
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
