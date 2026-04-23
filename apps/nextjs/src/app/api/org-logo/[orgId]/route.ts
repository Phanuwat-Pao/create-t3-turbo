import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { organization } from "@acme/db/schema";
import { type NextRequest, NextResponse } from "next/server";

import { s3 } from "~/server/s3";

const CACHE_MAX_AGE = 3600;

/**
 * Extract the userId from an S3 storage key.
 * Keys follow the pattern: users/{userId}/uploads/...
 */
function extractUserIdFromKey(key: string): string | null {
  const match = key.match(/^users\/([^/]+)\//);
  return match?.[1] ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  const result = await db
    .select({ logo: organization.logo })
    .from(organization)
    .where(eq(organization.id, orgId))
    .limit(1);

  const logo = result[0]?.logo;

  if (!logo) {
    return new NextResponse(null, { status: 404 });
  }

  // External URL
  if (logo.startsWith("http://") || logo.startsWith("https://")) {
    return NextResponse.redirect(logo, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
      status: 302,
    });
  }

  // Legacy base64 data URI
  if (logo.startsWith("data:")) {
    return NextResponse.redirect(logo, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
      status: 302,
    });
  }

  // S3 key - generate presigned download URL
  const userId = extractUserIdFromKey(logo);
  if (!userId) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { url } = await s3.getDownloadUrl({
      key: logo,
      userId,
    });

    return NextResponse.redirect(url, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
      status: 302,
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
