//import { createAuth } from "./convex/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

//type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
/*
const getSession = async (request: NextRequest) => {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        origin: request.nextUrl.origin,
      },
    },
  );
  return session;
};
*/

const signInRoutes = [
  "/forgot-password",
  "/reset-password",
  "/sign-in",
  "/two-factor",
];

// Just check cookie, recommended approach
export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  // Uncomment to fetch the session (not recommended)
  // const session = await getSession(request);

  const isSignInRoute = signInRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isSignInRoute && !sessionCookie) {
    return NextResponse.next();
  }

  if (!isSignInRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isSignInRoute || request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets and api routes
  matcher: ["/((?!.*\\..*|_next|api/auth).*)", "/", "/trpc(.*)"],
};
