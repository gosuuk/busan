import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createOfflineEventSchema } from "@/features/events/server/schema";
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

interface AdminEventRouteProps {
  params: Promise<{
    eventId: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: AdminEventRouteProps,
): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/events/[eventId]",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  const { eventId } = await params;

  try {
    const body = await readJsonBody(request, {
      maxBytes: 20_000,
    });
    const parsed = createOfflineEventSchema.parse(body);
    const [updatedEvent] = await db
      .update(offlineEvents)
      .set({
        title: parsed.title,
        description: parsed.description,
        region: parsed.region,
        locationName: parsed.locationName,
        address: parsed.address,
        targetRoles: parsed.targetRoles,
        techTopics: parsed.techTopics,
        participationFee: parsed.participationFee,
        startsAt: new Date(parsed.startsAt),
        endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
        capacity: parsed.capacity,
        status: parsed.status,
        updatedAt: new Date(),
      })
      .where(eq(offlineEvents.id, eventId))
      .returning();

    if (!updatedEvent) {
      return jsonError("Event not found", 404, "EVENT_NOT_FOUND");
    }

    await recordAdminAuditLog({
      action: "admin_offline_event_updated",
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: "offline_event",
      targetId: updatedEvent.id,
      metadata: {
        title: updatedEvent.title,
        status: updatedEvent.status,
      },
    });

    await recordApplicationLog({
      level: "info",
      message: "offline event updated",
      route: "/api/admin/events/[eventId]",
      method: "PATCH",
      status: "200",
      userId: sessionResult.session.user.id,
      metadata: {
        eventId: updatedEvent.id,
      },
    });

    return NextResponse.json(
      {
        event: updatedEvent,
      },
      {
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
      message: "offline event update failed",
      route: "/api/admin/events/[eventId]",
      method: "PATCH",
      status: "500",
      userId: sessionResult.session.user.id,
      metadata: {
        eventId,
      },
    });

    return jsonError("Unable to update event", 500, "EVENT_UPDATE_FAILED");
  }
}
