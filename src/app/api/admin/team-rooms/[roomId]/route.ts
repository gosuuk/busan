import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateTeamRoomStatusSchema } from "@/features/events/server/schema";
import {
  recordAdminAuditLog,
  requireAdminApiSession,
} from "@/server/auth/local/admin-security";
import { db } from "@/server/db";
import { teamRecruitmentRooms } from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { readJsonBody, RequestValidationError } from "@/server/security/request";

export const runtime = "nodejs";

interface AdminTeamRoomRouteProps {
  params: Promise<{ roomId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: AdminTeamRoomRouteProps,
): Promise<Response> {
  const sessionResult = await requireAdminApiSession({
    request,
    route: "/api/admin/team-rooms/[roomId]",
  });

  if (!sessionResult.ok) return sessionResult.response;

  const { roomId } = await params;

  try {
    const body = await readJsonBody(request, { maxBytes: 4_000 });
    const parsed = updateTeamRoomStatusSchema.parse(body);
    const [room] = await db
      .update(teamRecruitmentRooms)
      .set({ status: parsed.status, updatedAt: new Date() })
      .where(eq(teamRecruitmentRooms.id, roomId))
      .returning();

    if (!room) {
      return jsonError("팀을 찾을 수 없습니다.", 404, "TEAM_NOT_FOUND");
    }

    await recordAdminAuditLog({
      action: "admin_team_room_status_updated",
      actorRole: sessionResult.session.user.role,
      actorUserId: sessionResult.session.user.id,
      targetType: "team_recruitment_room",
      targetId: room.id,
      metadata: { status: room.status },
    });

    return NextResponse.json({ room });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }
    if (error instanceof ZodError) {
      return jsonError("팀 상태를 확인해주세요.", 400, "INVALID_BODY");
    }
    return jsonError("팀 상태를 변경하지 못했습니다.", 500, "TEAM_UPDATE_FAILED");
  }
}
