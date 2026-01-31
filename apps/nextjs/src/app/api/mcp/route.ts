import { mcpHandler } from "@better-auth/oauth-provider";
import { createMcpHandler } from "mcp-handler";
import { type NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const baseUrl = process.env.BETTER_AUTH_URL || "https://demo.better-auth.com";

/**
 * Example derived from https://www.npmjs.com/package/mcp-handler
 */
const handler = mcpHandler(
  {
    jwksUrl: `${baseUrl}/api/auth/jwks`,
    verifyOptions: {
      audience: `${baseUrl}/api/mcp`,
      issuer: baseUrl,
    },
  },
  (req, jwt) =>
    createMcpHandler(
      (server) => {
        server.registerTool(
          "echo",
          {
            description: "Echo a message",
            inputSchema: {
              message: z.string(),
            },
          },
          async ({ message }: { message: string }) => {
            const baseUrl =
              process.env.BETTER_AUTH_URL || "https://demo.better-auth.com";
            const org = jwt?.[`${baseUrl}/org`];
            return {
              content: [
                {
                  text: `Echo: ${message}${
                    jwt?.sub ? ` for user ${jwt?.sub}` : ""
                  }${org ? ` for organization ${org}` : ""}`,
                  type: "text",
                },
              ],
            };
          }
        );
      },
      {
        serverInfo: {
          name: "demo-better-auth",
          version: "1.0.0",
        },
      },
      {
        basePath: "/api",
        maxDuration: 60,
        verboseLogs: true,
      }
    )(req)
);

function addCorsHeaders(headers: Headers) {
  if (process.env.NODE_ENV === "development") {
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Access-Control-Allow-Headers",
      "authorization, content-type, mcp-protocol-version"
    );
  }
}

function withCors(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    const res = await handler(req);
    addCorsHeaders(res.headers);
    return res;
  };
}

export const GET = withCors(handler);
export const POST = withCors(handler);
export async function OPTIONS(_req: NextRequest): Promise<NextResponse> {
  const headers = new Headers();
  addCorsHeaders(headers);
  return new NextResponse(null, {
    headers,
  });
}
