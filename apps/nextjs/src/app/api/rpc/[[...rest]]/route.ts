import type { NextRequest } from "next/server";

import { appRouter, createContext } from "@acme/api";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";

import { auth } from "~/auth/server";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(">>> oRPC Error:", error);
    }),
  ],
});

/**
 * Configure basic CORS headers
 * You should extend this to match your needs
 */
const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
};

export const OPTIONS = () => {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
};

async function handleRequest(req: NextRequest) {
  const { response, matched } = await handler.handle(req, {
    context: await createContext({
      headers: req.headers,
      auth,
    }),
    prefix: "/api/rpc",
  });

  if (matched) {
    setCorsHeaders(response);
    return response;
  }

  return new Response("Not Found", { status: 404 });
}

export { handleRequest as GET, handleRequest as POST };
