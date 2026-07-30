import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  loginRequestSchema,
  normalizeEmail,
} from "@/features/auth/server/schema";
import { issueAuthCookies } from "@/server/auth/local/session";
import { verifyPassword } from "@/server/auth/local/password";
import { db } from "@/server/db";
import { localUsers, localUserStatuses } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import { getClientIp } from "@/server/security/client-ip";
import { checkRateLimit } from "@/server/security/rate-limit";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await readJsonBody(request, {
      maxBytes: 10_000,
    });
    const parsed = loginRequestSchema.parse(body);
    const email = normalizeEmail(parsed.email);
    const rateLimit = checkRateLimit(
      `login:${getClientIp(request)}:${email}`,
      {
        limit: 10,
        windowMs: 60_000,
      },
    );

    if (!rateLimit.allowed) {
      return jsonError("Too many requests", 429, "RATE_LIMITED");
    }

    const [user] = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.email, email))
      .limit(1);

    if (!user || !(await verifyPassword(parsed.password, user.passwordHash))) {
      await recordApplicationLog({
        level: "warn",
        message: "local login failed",
        route: "/api/auth/login",
        method: "POST",
        status: "401",
      });
      return jsonError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    if (user.status !== localUserStatuses.ACTIVE) {
      return jsonError("Account is not active", 403, "ACCOUNT_INACTIVE");
    }

    await db
      .update(localUsers)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(localUsers.id, user.id));

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          phoneNumber: user.phoneNumber,
          role: user.role,
          status: user.status,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    issueAuthCookies(response, user);
    await recordApplicationLog({
      level: "info",
      message: "local user logged in",
      route: "/api/auth/login",
      method: "POST",
      status: "200",
      userId: user.id,
    });

    return response;
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError("Invalid login payload", 400, "INVALID_BODY");
    }

    await recordApplicationLog({
      level: "error",
      message: "local login error",
      route: "/api/auth/login",
      method: "POST",
      status: "500",
    });

    return jsonError("Unable to log in", 500, "LOGIN_FAILED");
  }
}
