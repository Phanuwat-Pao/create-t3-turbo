import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { user } from "@acme/db/schema";
import { type NextRequest, NextResponse } from "next/server";

import { s3 } from "~/server/s3";

const CACHE_MAX_AGE = 3600;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const result = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const image = result[0]?.image;

  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  // External URL (OAuth provider avatars)
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return NextResponse.redirect(image, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
      status: 302,
    });
  }

  // Legacy base64 data URI
  if (image.startsWith("data:")) {
    return NextResponse.redirect(image, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
      status: 302,
    });
  }

  // S3 key - generate presigned download URL
  try {
    const { url } = await s3.getDownloadUrl({
      key: image,
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
