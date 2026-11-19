import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Purges Prismic content from Next.js' cache. Called by the Prismic webhook
 * when a document is published or unpublished.
 *
 * Authenticated via the shared "Secret" passphrase configured on the Prismic
 * webhook. Prismic posts the secret in the JSON body (`secret`). It must match
 * `PRISMIC_WEBHOOK_SECRET` in the deployed env.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.PRISMIC_WEBHOOK_SECRET;
  if (!expected) {
    // Fail closed if the env var hasn't been set on the server.
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 503 },
    );
  }

  let provided = "";
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "secret" in body) {
      const secret = (body as { secret: unknown }).secret;
      provided = typeof secret === "string" ? secret : "";
    }
  } catch {
    // Unparseable body: treated as a missing secret below.
  }

  // Hash both sides so the buffers are equal length, then compare in constant
  // time. This avoids leaking the secret's length or prefix.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("prismic", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
