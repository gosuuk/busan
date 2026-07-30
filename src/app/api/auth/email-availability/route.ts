import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeEmail } from "@/features/auth/server/schema";
import { db } from "@/server/db";
import { localUsers } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { getClientIp } from "@/server/security/client-ip";
import { checkRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

const emailQuerySchema = z.object({
  email: z.string().trim().email().max(255),
});

export async function GET(request: Request): Promise<Response> {
  const rateLimit = checkRateLimit(`email-check:${getClientIp(request)}`, {
    limit: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many requests", 429, "RATE_LIMITED");
  }

  const searchParams = new URL(request.url).searchParams;
  const parsed = emailQuerySchema.safeParse({
    email: searchParams.get("email"),
  });

  if (!parsed.success) {
    return jsonError("Invalid email", 400, "INVALID_EMAIL");
  }

  const email = normalizeEmail(parsed.data.email);
  const [existingUser] = await db
    .select({
      id: localUsers.id,
    })
    .from(localUsers)
    .where(eq(localUsers.email, email))
    .limit(1);

  return NextResponse.json(
    {
      available: !existingUser,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
