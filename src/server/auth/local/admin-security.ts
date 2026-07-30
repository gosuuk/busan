import "server-only";

import { NextResponse } from "next/server";

import { db } from "@/server/db";
import { auditLogs, securityEvents } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import { getClientIp } from "@/server/security/client-ip";
import { checkRateLimit } from "@/server/security/rate-limit";

import {
  getAdminSessionFromRequest,
  type LocalAuthSession,
} from "./session";

type AdminApiSessionResult =
  | {
      ok: true;
      session: LocalAuthSession;
    }
  | {
      ok: false;
      response: NextResponse;
    };

interface RequireAdminApiSessionOptions {
  route: string;
  request: Request;
}

export async function requireAdminApiSession({
  request,
  route,
}: RequireAdminApiSessionOptions): Promise<AdminApiSessionResult> {
  const preAuthRateLimit = checkRateLimit(
    `admin-preauth:${route}:${getClientIp(request)}`,
    {
      limit: 30,
      windowMs: 60_000,
    },
  );

  if (!preAuthRateLimit.allowed) {
    await recordAdminSecurityEvent({
      eventType: "admin_rate_limited",
      route,
      severity: "warn",
      metadata: {
        phase: "preauth",
      },
    });
    await recordApplicationLog({
      level: "warn",
      message: "admin request rate limited",
      route,
      status: "429",
    });

    return {
      ok: false,
      response: jsonError("Too many requests", 429, "RATE_LIMITED"),
    };
  }

  const session = await getAdminSessionFromRequest(request);

  if (!session) {
    await recordAdminSecurityEvent({
      eventType: "admin_access_denied",
      route,
      severity: "warn",
      metadata: {
        reason: "missing_or_invalid_admin_token",
      },
    });
    await recordApplicationLog({
      level: "warn",
      message: "admin access denied",
      route,
      status: "403",
    });

    return {
      ok: false,
      response: jsonError("Forbidden", 403, "FORBIDDEN"),
    };
  }

  const postAuthRateLimit = checkRateLimit(
    `admin:${route}:${session.user.id}`,
    {
      limit: 120,
      windowMs: 60_000,
    },
  );

  if (!postAuthRateLimit.allowed) {
    await recordAdminSecurityEvent({
      eventType: "admin_rate_limited",
      route,
      severity: "warn",
      userId: session.user.id,
      metadata: {
        phase: "postauth",
      },
    });
    await recordApplicationLog({
      level: "warn",
      message: "admin authenticated request rate limited",
      route,
      status: "429",
      userId: session.user.id,
    });

    return {
      ok: false,
      response: jsonError("Too many requests", 429, "RATE_LIMITED"),
    };
  }

  return {
    ok: true,
    session,
  };
}

export async function recordAdminSecurityEvent(input: {
  eventType: string;
  metadata?: Record<string, string | number | boolean | null>;
  route: string;
  severity: "info" | "warn" | "error";
  userId?: string;
}): Promise<void> {
  try {
    await db.insert(securityEvents).values({
      userId: input.userId,
      eventType: input.eventType,
      severity: input.severity,
      route: input.route,
      metadata: input.metadata ?? {},
      occurredAt: new Date(),
    });
  } catch {
    // Security logging must not expose internal failures to the client path.
  }
}

export async function recordAdminAuditLog(input: {
  action: string;
  actorRole: string;
  actorUserId: string;
  metadata?: Record<string, string | number | boolean | null>;
  reason?: string;
  targetId?: string;
  targetType?: string;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      metadata: input.metadata ?? {},
      occurredAt: new Date(),
    });
  } catch {
    // Audit logging is best-effort for UI click telemetry.
  }
}
