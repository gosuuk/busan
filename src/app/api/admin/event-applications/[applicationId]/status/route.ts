import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordProductEvent } from "@/features/analytics/server/record-event";
import {
  analyticsEvents,
  updateEventApplicationStatusSchema,
} from "@/features/events/server/schema";
import {
  recordAdminAuditLog,
  requireAdminApiSession,
} from "@/server/auth/local/admin-security";
import { db } from "@/server/db";
import { eventApplications, offlineEvents } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

interface StatusRouteProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: StatusRouteProps,
): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/event-applications/status",
  });

  if (!sessionResult.ok) {
    return sessionResult.response;
  }

  const { applicationId } = await params;

  try {
    const body = await readJsonBody(request, {
      maxBytes: 4_000,
    });
    const parsed = updateEventApplicationStatusSchema.parse(body);
    const [application] = await db
      .update(eventApplications)
      .set({
        attendanceStatus: parsed.attendanceStatus,
        updatedAt: new Date(),
      })
      .where(eq(eventApplications.id, applicationId))
      .returning();

    if (!application) {
      return jsonError("Application not found", 404, "APPLICATION_NOT_FOUND");
    }

    const [event] = await db
      .select({
        slug: offlineEvents.slug,
      })
      .from(offlineEvents)
      .where(eq(offlineEvents.id, application.eventId))
      .limit(1);

    await recordAdminAuditLog({
      action: "admin_event_application_status_updated",
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: "event_application",
      targetId: application.id,
      metadata: {
        attendanceStatus: parsed.attendanceStatus,
        eventId: application.eventId,
      },
    });
    await recordProductEvent({
      eventName: analyticsEvents.eventAttendanceConfirmed,
      entityType: "event",
      entityId: application.eventId,
      pagePath: event ? `/events/${event.slug}` : undefined,
      source: "admin",
      userId: application.memberId,
      properties: {
        attendanceStatus: parsed.attendanceStatus,
      },
    });
    await recordApplicationLog({
      level: "info",
      message: "event application status updated",
      route: "/api/admin/event-applications/status",
      method: "PATCH",
      status: "200",
      userId: sessionResult.session.user.id,
      metadata: {
        applicationId: application.id,
        attendanceStatus: parsed.attendanceStatus,
      },
    });

    return NextResponse.json(
      {
        application,
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
      return jsonError("Invalid status payload", 400, "INVALID_BODY");
    }

    return jsonError("Unable to update status", 500, "STATUS_UPDATE_FAILED");
  }
}
