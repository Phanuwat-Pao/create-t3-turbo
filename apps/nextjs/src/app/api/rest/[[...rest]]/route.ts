import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { CompressionPlugin } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";

import { appRouter, createContext } from "@acme/api";

import { auth } from "~/auth/server";
import origins from "~/config/origin";

// const handler = new RPCHandler(appRouter, {
//   interceptors: [
//     onError((error) => {
//       console.error(error);
//     }),
//   ],
// });

const handler = new OpenAPIHandler(appRouter, {
  plugins: [
    new CORSPlugin({
      origin: origins,
      credentials: true,
      exposeHeaders: ["Content-Disposition"],
    }),
    new CompressionPlugin(),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handleRequest(request: Request) {
  const context = await createContext({
    auth,
    headers: request.headers,
  });
  const { response } = await handler.handle(request, {
    prefix: `/api/rest`,
    context, // Provide initial context if needed
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
