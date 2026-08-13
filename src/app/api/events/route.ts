import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createEventSlug,
  createOfflineEventSchema,
} from "@/features/events/server/schema";
import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import { offlineEvents, offlineEventStatuses } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { recordApplicationLog } from "@/server/logging/application-log";
import {
  readJsonBody,
  RequestValidationError,
} from "@/server/security/request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("로그인이 필요합니다.", 401, "UNAUTHORIZED");
  }

  try {
    const body = await readJsonBody(request, { maxBytes: 20_000 });
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
        status: offlineEventStatuses.PENDING,
        createdByUserId: session.user.id,
      })
      .returning();

    await recordApplicationLog({
      level: "info",
      message: "member event submitted for review",
      route: "/api/events",
      method: "POST",
      status: "201",
      userId: session.user.id,
      metadata: { eventId: createdEvent.id },
    });

    return NextResponse.json({ event: createdEvent }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError(
        "행사 입력값을 다시 확인해주세요.",
        400,
        "INVALID_BODY",
        error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    return jsonError("행사를 등록하지 못했습니다.", 500, "EVENT_CREATE_FAILED");
  }
}
