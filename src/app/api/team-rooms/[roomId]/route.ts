import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateTeamRoomStatusSchema } from "@/features/events/server/schema";
import { hasActiveEventApplication } from "@/features/events/server/queries";
import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import { teamRecruitmentRooms } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { readJsonBody, RequestValidationError } from "@/server/security/request";

export const runtime = "nodejs";

interface TeamRoomRouteProps {
  params: Promise<{ roomId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: TeamRoomRouteProps,
): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("로그인이 필요합니다.", 401, "UNAUTHORIZED");
  }

  const { roomId } = await params;

  try {
    const body = await readJsonBody(request, { maxBytes: 4_000 });
    const parsed = updateTeamRoomStatusSchema.parse(body);
    const [room] = await db
      .select()
      .from(teamRecruitmentRooms)
      .where(eq(teamRecruitmentRooms.id, roomId))
      .limit(1);

    if (!room) {
      return jsonError("팀을 찾을 수 없습니다.", 404, "TEAM_NOT_FOUND");
    }

    if (room.leaderId !== session.user.id) {
      return jsonError("방장만 팀 상태를 바꿀 수 있습니다.", 403, "FORBIDDEN");
    }

    if (!(await hasActiveEventApplication(room.eventId, session.user.id))) {
      return jsonError("행사 참가 신청이 필요합니다.", 403, "EVENT_APPLICATION_REQUIRED");
    }

    const [updatedRoom] = await db
      .update(teamRecruitmentRooms)
      .set({ status: parsed.status, updatedAt: new Date() })
      .where(eq(teamRecruitmentRooms.id, roomId))
      .returning();

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError("팀 상태를 확인해주세요.", 400, "INVALID_BODY");
    }

    return jsonError("팀 상태를 바꾸지 못했습니다.", 500, "TEAM_UPDATE_FAILED");
  }
}
