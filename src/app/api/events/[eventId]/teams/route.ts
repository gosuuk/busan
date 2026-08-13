import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { hasActiveEventApplication, isEventEnded } from "@/features/events/server/queries";
import { createTeamRoomSchema } from "@/features/events/server/schema";
import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import {
  offlineEvents,
  offlineEventStatuses,
  teamApplicationStatuses,
  teamRecruitmentRooms,
  teamRoomApplications,
} from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { readJsonBody, RequestValidationError } from "@/server/security/request";

export const runtime = "nodejs";

interface TeamRoomsRouteProps {
  params: Promise<{ eventId: string }>;
}

export async function POST(
  request: Request,
  { params }: TeamRoomsRouteProps,
): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("로그인이 필요합니다.", 401, "UNAUTHORIZED");
  }

  const { eventId } = await params;

  try {
    const body = await readJsonBody(request, { maxBytes: 12_000 });
    const parsed = createTeamRoomSchema.parse(body);
    const [event] = await db
      .select()
      .from(offlineEvents)
      .where(eq(offlineEvents.id, eventId))
      .limit(1);

    if (
      !event ||
      event.status !== offlineEventStatuses.PUBLISHED ||
      isEventEnded(event)
    ) {
      return jsonError("팀을 만들 수 없는 행사입니다.", 409, "EVENT_UNAVAILABLE");
    }

    if (!(await hasActiveEventApplication(eventId, session.user.id))) {
      return jsonError(
        "행사 참가 신청 후 팀을 만들 수 있습니다.",
        403,
        "EVENT_APPLICATION_REQUIRED",
      );
    }

    const [existingRoom] = await db
      .select({ id: teamRecruitmentRooms.id })
      .from(teamRecruitmentRooms)
      .where(
        and(
          eq(teamRecruitmentRooms.eventId, eventId),
          eq(teamRecruitmentRooms.leaderId, session.user.id),
        ),
      )
      .limit(1);

    if (existingRoom) {
      return jsonError(
        "행사마다 한 개의 팀만 만들 수 있습니다.",
        409,
        "TEAM_ROOM_ALREADY_EXISTS",
      );
    }

    const [existingTeamMembership] = await db
      .select({ id: teamRoomApplications.id })
      .from(teamRoomApplications)
      .innerJoin(
        teamRecruitmentRooms,
        eq(teamRoomApplications.roomId, teamRecruitmentRooms.id),
      )
      .where(
        and(
          eq(teamRecruitmentRooms.eventId, eventId),
          eq(teamRoomApplications.memberId, session.user.id),
          eq(
            teamRoomApplications.status,
            teamApplicationStatuses.ACCEPTED,
          ),
        ),
      )
      .limit(1);

    if (existingTeamMembership) {
      return jsonError(
        "이미 이 행사의 다른 팀에 합류했습니다.",
        409,
        "MEMBER_ALREADY_ON_TEAM",
      );
    }

    const [room] = await db
      .insert(teamRecruitmentRooms)
      .values({
        eventId,
        leaderId: session.user.id,
        title: parsed.title,
        description: parsed.description,
        neededRoles: parsed.neededRoles,
        capacity: parsed.capacity,
        contact: parsed.contact,
      })
      .returning();

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError(
        error.issues[0]?.message ?? "팀 입력값을 확인해주세요.",
        400,
        "INVALID_BODY",
      );
    }

    return jsonError("팀을 만들지 못했습니다.", 500, "TEAM_ROOM_CREATE_FAILED");
  }
}
