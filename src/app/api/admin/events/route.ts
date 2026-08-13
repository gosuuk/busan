import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createEventSlug,
  createOfflineEventSchema,
} from "@/features/events/server/schema";
import {
  recordAdminAuditLog,
  requireAdminApiSession,
} from "@/server/auth/local/admin-security";
import { db } from "@/server/db";
import { offlineEvents } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/events",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  const events = await db
    .select()
    .from(offlineEvents)
    .orderBy(desc(offlineEvents.startsAt))
    .limit(50);

  await recordApplicationLog({
    level: "info",
    message: "admin offline events listed",
    route: "/api/admin/events",
    method: "GET",
    status: "200",
    userId: sessionResult.session.user.id,
  });

  return NextResponse.json(
    {
      events,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/events",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  try {
    const body = await readJsonBody(request, {
      maxBytes: 20_000,
    });
    const parsed = createOfflineEventSchema.parse(body);
    const [createdEvent] = await db
      .insert(offlineEvents)
      .values({
        title: parsed.title,
        slug: createEventSlug(parsed.title),
        category: parsed.category,
        description: parsed.description,
        region: parsed.region,
        locationName: parsed.locationName,
        address: parsed.address,
        targetRoles: parsed.targetRoles,
        techTopics: parsed.techTopics,
        participationFee: parsed.participationFee,
        startsAt: new Date(parsed.startsAt),
        endsAt: parsed.endsAt ? new Date(parsed.endsAt) : undefined,
        capacity: parsed.capacity,
        status: parsed.status,
        createdByUserId: sessionResult.session.user.id,
      })
      .returning();

    await recordAdminAuditLog({
      action: "admin_offline_event_created",
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: "offline_event",
      targetId: createdEvent.id,
      metadata: {
        category: createdEvent.category,
        title: createdEvent.title,
        status: createdEvent.status,
      },
    });

    await recordApplicationLog({
      level: "info",
      message: "offline event created",
      route: "/api/admin/events",
      method: "POST",
      status: "201",
      userId: sessionResult.session.user.id,
      metadata: {
        eventId: createdEvent.id,
      },
    });

    return NextResponse.json(
      {
        event: createdEvent,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError(
        "모임 입력값을 다시 확인해주세요.",
        400,
        "INVALID_BODY",
        error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    await recordApplicationLog({
      level: "error",
      message: "offline event creation failed",
      route: "/api/admin/events",
      method: "POST",
      status: "500",
      userId: sessionResult.session.user.id,
    });

    return jsonError("Unable to create event", 500, "EVENT_CREATE_FAILED");
  }
}
