import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordProductEvent } from "@/features/analytics/server/record-event";
import {
  analyticsEvents,
  applyEventSchema,
} from "@/features/events/server/schema";
import { isEventEnded } from "@/features/events/server/queries";
import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import {
  eventApplications,
  eventApplicationStatuses,
  offlineEvents,
  offlineEventStatuses,
} from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

interface ApplyRouteProps {
  params: Promise<{
    eventId: string;
  }>;
}

const occupiedStatuses = new Set<string>([
  eventApplicationStatuses.REGISTERED,
  eventApplicationStatuses.CONFIRMED,
  eventApplicationStatuses.ATTENDED,
]);

export async function POST(
  request: Request,
  { params }: ApplyRouteProps,
): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { eventId } = await params;

  try {
    const body = await readJsonBody(request, {
      maxBytes: 8_000,
    });
    const parsed = applyEventSchema.parse(body);
    const [event] = await db
      .select()
      .from(offlineEvents)
      .where(eq(offlineEvents.id, eventId))
      .limit(1);

    if (!event || event.status !== offlineEventStatuses.PUBLISHED) {
      return jsonError("Event is not available", 404, "EVENT_NOT_FOUND");
    }

    if (isEventEnded(event)) {
      return jsonError("Event has ended", 409, "EVENT_ENDED");
    }

    const [existingApplication] = await db
      .select()
      .from(eventApplications)
      .where(
        and(
          eq(eventApplications.eventId, event.id),
          eq(eventApplications.memberId, session.user.id),
        ),
      )
      .limit(1);

    if (
      existingApplication &&
      existingApplication.attendanceStatus !== eventApplicationStatuses.CANCELLED
    ) {
      return jsonError("Already applied", 409, "ALREADY_APPLIED");
    }

    const applications = await db
      .select({
        attendanceStatus: eventApplications.attendanceStatus,
      })
      .from(eventApplications)
      .where(eq(eventApplications.eventId, event.id));
    const occupiedCount = applications.filter((application) =>
      occupiedStatuses.has(application.attendanceStatus),
    ).length;
    const attendanceStatus =
      occupiedCount < event.capacity
        ? eventApplicationStatuses.REGISTERED
        : eventApplicationStatuses.WAITLISTED;

    const [application] = await db
      .insert(eventApplications)
      .values({
        eventId: event.id,
        memberId: session.user.id,
        participationReason: parsed.participationReason,
        attendanceStatus,
      })
      .returning();

    await recordProductEvent({
      eventName: analyticsEvents.eventApplyClicked,
      entityType: "event",
      entityId: event.id,
      pagePath: `/events/${event.slug}`,
      source: "web",
      userId: session.user.id,
    });
    await recordProductEvent({
      eventName: analyticsEvents.eventRegistrationCompleted,
      entityType: "event",
      entityId: event.id,
      pagePath: `/events/${event.slug}`,
      source: "web",
      userId: session.user.id,
      properties: {
        attendanceStatus,
      },
    });
    await recordApplicationLog({
      level: "info",
      message: "event application created",
      route: `/api/events/${event.id}/apply`,
      method: "POST",
      status: "201",
      userId: session.user.id,
      metadata: {
        eventId: event.id,
        attendanceStatus,
      },
    });

    return NextResponse.json(
      {
        application,
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
      return jsonError("Invalid application payload", 400, "INVALID_BODY");
    }

    return jsonError("Unable to apply event", 500, "EVENT_APPLY_FAILED");
  }
}

export async function DELETE(
  request: Request,
  { params }: ApplyRouteProps,
): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { eventId } = await params;

  const [event] = await db
    .select({
      id: offlineEvents.id,
      slug: offlineEvents.slug,
    })
    .from(offlineEvents)
    .where(eq(offlineEvents.id, eventId))
    .limit(1);

  if (!event) {
    return jsonError("Event is not available", 404, "EVENT_NOT_FOUND");
  }

  const applications = await db
    .select()
    .from(eventApplications)
    .where(
      and(
        eq(eventApplications.eventId, event.id),
        eq(eventApplications.memberId, session.user.id),
      ),
    );
  const application = applications.find(
    (item) => item.attendanceStatus !== eventApplicationStatuses.CANCELLED,
  );

  if (!application) {
    return jsonError("Application not found", 404, "APPLICATION_NOT_FOUND");
  }

  const [cancelledApplication] = await db
    .update(eventApplications)
    .set({
      attendanceStatus: eventApplicationStatuses.CANCELLED,
      updatedAt: new Date(),
    })
    .where(eq(eventApplications.id, application.id))
    .returning();

  await recordProductEvent({
    eventName: analyticsEvents.eventRegistrationCancelled,
    entityType: "event",
    entityId: event.id,
    pagePath: `/events/${event.slug}`,
    source: "web",
    userId: session.user.id,
  });
  await recordApplicationLog({
    level: "info",
    message: "event application cancelled",
    route: `/api/events/${event.id}/apply`,
    method: "DELETE",
    status: "200",
    userId: session.user.id,
    metadata: {
      eventId: event.id,
      applicationId: cancelledApplication.id,
    },
  });

  return NextResponse.json(
    {
      application: cancelledApplication,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
