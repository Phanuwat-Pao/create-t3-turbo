import { NextResponse } from "next/server";

import { baseUrl } from "~/auth/server";
import { serverClient } from "~/lib/server-client";

export async function GET(): Promise<NextResponse> {
  // Must match the `resources` entry in initAuth, which is also the `aud` of
  // the access tokens this app issues for itself.
  const config = await serverClient.getProtectedResourceMetadata({
    resource: baseUrl,
  });
  const headers = new Headers();
  if (process.env.NODE_ENV === "development") {
    headers.set("Access-Control-Allow-Methods", "GET");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Cache-Control",
      "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400"
    );
  }
  return NextResponse.json(config, {
    headers,
  });
}
