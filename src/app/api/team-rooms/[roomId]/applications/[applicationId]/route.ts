import { and, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateTeamApplicationSchema } from "@/features/events/server/schema";
import { hasActiveEventApplication } from "@/features/events/server/queries";
import { getMemberSessionFromRequest } from "@/server/auth/local/session";
import { db } from "@/server/db";
import {
  teamApplicationStatuses,
  teamRecruitmentRooms,
  teamRoomApplications,
  teamRoomStatuses,
} from "@/server/db/schema";
import { jsonError } from "@/server/http/responses";
import { readJsonBody, RequestValidationError } from "@/server/security/request";

export const runtime = "nodejs";

interface ManageTeamApplicationRouteProps {
  params: Promise<{ applicationId: string; roomId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: ManageTeamApplicationRouteProps,
): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("로그인이 필요합니다.", 401, "UNAUTHORIZED");
  }

  const { applicationId, roomId } = await params;

  try {
    const body = await readJsonBody(request, { maxBytes: 4_000 });
    const parsed = updateTeamApplicationSchema.parse(body);
    const [room] = await db
      .select()
      .from(teamRecruitmentRooms)
      .where(eq(teamRecruitmentRooms.id, roomId))
      .limit(1);

    if (!room) {
      return jsonError("팀을 찾을 수 없습니다.", 404, "TEAM_NOT_FOUND");
    }

    if (room.leaderId !== session.user.id) {
      return jsonError("방장만 지원자를 관리할 수 있습니다.", 403, "FORBIDDEN");
    }

    if (!(await hasActiveEventApplication(room.eventId, session.user.id))) {
      return jsonError("행사 참가 신청이 필요합니다.", 403, "EVENT_APPLICATION_REQUIRED");
    }

    const [target] = await db
      .select()
      .from(teamRoomApplications)
      .where(
        and(
          eq(teamRoomApplications.id, applicationId),
          eq(teamRoomApplications.roomId, roomId),
        ),
      )
      .limit(1);

    if (!target) {
      return jsonError("지원자를 찾을 수 없습니다.", 404, "APPLICATION_NOT_FOUND");
    }

    if (parsed.status === teamApplicationStatuses.ACCEPTED) {
      const [otherAcceptedTeam] = await db
        .select({ id: teamRoomApplications.id })
        .from(teamRoomApplications)
        .innerJoin(
          teamRecruitmentRooms,
          eq(teamRoomApplications.roomId, teamRecruitmentRooms.id),
        )
        .where(
          and(
            eq(teamRecruitmentRooms.eventId, room.eventId),
            ne(teamRecruitmentRooms.id, room.id),
            eq(teamRoomApplications.memberId, target.memberId),
            eq(
              teamRoomApplications.status,
              teamApplicationStatuses.ACCEPTED,
            ),
          ),
        )
        .limit(1);

      if (otherAcceptedTeam) {
        return jsonError(
          "이 회원은 이미 같은 행사의 다른 팀에 합류했습니다.",
          409,
          "MEMBER_ALREADY_ON_TEAM",
        );
      }

      const applications = await db
        .select({ status: teamRoomApplications.status })
        .from(teamRoomApplications)
        .where(eq(teamRoomApplications.roomId, roomId));
      const acceptedCount = applications.filter(
        (application) =>
          application.status === teamApplicationStatuses.ACCEPTED,
      ).length;

      if (
        target.status !== teamApplicationStatuses.ACCEPTED &&
        acceptedCount + 1 >= room.capacity
      ) {
        return jsonError("팀 정원이 마감되었습니다.", 409, "TEAM_FULL");
      }
    }

    const [application] = await db
      .update(teamRoomApplications)
      .set({ status: parsed.status, updatedAt: new Date() })
      .where(eq(teamRoomApplications.id, target.id))
      .returning();

    if (parsed.status === teamApplicationStatuses.ACCEPTED) {
      await db
        .update(teamRoomApplications)
        .set({
          status: teamApplicationStatuses.REJECTED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(teamRoomApplications.memberId, target.memberId),
            eq(teamRoomApplications.status, teamApplicationStatuses.PENDING),
            ne(teamRoomApplications.id, target.id),
            sql`${teamRoomApplications.roomId} in (
              select ${teamRecruitmentRooms.id}
              from ${teamRecruitmentRooms}
              where ${teamRecruitmentRooms.eventId} = ${room.eventId}
            )`,
          ),
        );

      const accepted = await db
        .select({ id: teamRoomApplications.id })
        .from(teamRoomApplications)
        .where(
          and(
            eq(teamRoomApplications.roomId, roomId),
            eq(teamRoomApplications.status, teamApplicationStatuses.ACCEPTED),
          ),
        );

      if (accepted.length + 1 >= room.capacity) {
        await db
          .update(teamRecruitmentRooms)
          .set({ status: teamRoomStatuses.FULL, updatedAt: new Date() })
          .where(eq(teamRecruitmentRooms.id, roomId));
      }
    } else if (target.status === teamApplicationStatuses.ACCEPTED) {
      await db
        .update(teamRecruitmentRooms)
        .set({ status: teamRoomStatuses.RECRUITING, updatedAt: new Date() })
        .where(
          and(
            eq(teamRecruitmentRooms.id, roomId),
            eq(teamRecruitmentRooms.status, teamRoomStatuses.FULL),
          ),
        );
    }

    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError("처리 상태를 확인해주세요.", 400, "INVALID_BODY");
    }

    return jsonError("지원자 상태를 변경하지 못했습니다.", 500, "TEAM_APPLICATION_UPDATE_FAILED");
  }
}
