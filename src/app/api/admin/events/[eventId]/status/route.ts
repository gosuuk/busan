import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import {
  recordAdminAuditLog,
  requireAdminApiSession,
} from "@/server/auth/local/admin-security";
import { db } from "@/server/db";
import { offlineEvents, offlineEventStatuses } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { readJsonBody, RequestValidationError } from "@/server/security/request";

export const runtime = "nodejs";

const schema = z.object({
  status: z.enum([
    offlineEventStatuses.DRAFT,
    offlineEventStatuses.PENDING,
    offlineEventStatuses.PUBLISHED,
    offlineEventStatuses.CLOSED,
    offlineEventStatuses.CANCELED,
    offlineEventStatuses.REJECTED,
  ]),
});

interface AdminEventStatusRouteProps {
  params: Promise<{ eventId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: AdminEventStatusRouteProps,
): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/events/[eventId]/status",
  });

  if (!sessionResult.ok) return sessionResult.response;

  const { eventId } = await params;

  try {
    const body = await readJsonBody(request, { maxBytes: 4_000 });
    const parsed = schema.parse(body);
    const [event] = await db
      .update(offlineEvents)
      .set({ status: parsed.status, updatedAt: new Date() })
      .where(eq(offlineEvents.id, eventId))
      .returning();

    if (!event) {
      return jsonError("행사를 찾을 수 없습니다.", 404, "EVENT_NOT_FOUND");
    }

    await recordAdminAuditLog({
      action: "admin_event_status_updated",
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: "offline_event",
      targetId: event.id,
      metadata: { status: event.status },
    });

    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }
    if (error instanceof ZodError) {
      return jsonError("행사 상태를 확인해주세요.", 400, "INVALID_BODY");
    }
    return jsonError("행사 상태를 변경하지 못했습니다.", 500, "EVENT_STATUS_UPDATE_FAILED");
  }
}
