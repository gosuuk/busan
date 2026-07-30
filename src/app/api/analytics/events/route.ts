import { ZodError } from "zod";

import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import { analyticsEvents } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { writeLog } from "@/server/logging/logger";
import { checkRateLimit } from "@/server/security/rate-limit";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";
import { parseAnalyticsEvent } from "@/features/analytics/server/schema";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const rateLimit = checkRateLimit(`analytics:${session.user.id}`, {
    limit: 60,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many requests", 429, "RATE_LIMITED");
  }

  try {
    const requestBody = await readJsonBody(request, {
      maxBytes: 10_000,
    });
    const parsedEvent = parseAnalyticsEvent(requestBody);

    await db.insert(analyticsEvents).values({
      userId: session.user.id,
      sessionId: parsedEvent.sessionId,
      eventName: parsedEvent.eventName,
      eventVersion: String(parsedEvent.eventVersion),
      pagePath: parsedEvent.pagePath,
      referrerDomain: parsedEvent.referrerDomain,
      entityType: parsedEvent.entityType,
      entityId: parsedEvent.entityId,
      properties: parsedEvent.properties ?? {},
      source: "web",
      occurredAt: new Date(parsedEvent.occurredAt),
    });

    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError("Invalid analytics event payload", 400, "INVALID_BODY");
    }

    writeLog("error", "analytics event ingestion failed", {
      route: "/api/analytics/events",
      userId: session.user.id,
      errorCode: "ANALYTICS_INGESTION_FAILED",
    });

    return jsonError("Internal server error", 500, "INTERNAL_ERROR");
  }
}
