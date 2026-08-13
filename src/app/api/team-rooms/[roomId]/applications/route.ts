import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { hasActiveEventApplication } from "@/features/events/server/queries";
import {
  applyTeamRoomSchema,
  teamProfileDisclosureConsentVersion,
} from "@/features/events/server/schema";
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

interface TeamApplicationRouteProps {
  params: Promise<{ roomId: string }>;
}

export async function POST(
  request: Request,
  { params }: TeamApplicationRouteProps,
): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("로그인이 필요합니다.", 401, "UNAUTHORIZED");
  }

  const { roomId } = await params;

  try {
    const body = await readJsonBody(request, { maxBytes: 8_000 });
    const parsed = applyTeamRoomSchema.parse(body);
    const [room] = await db
      .select()
      .from(teamRecruitmentRooms)
      .where(eq(teamRecruitmentRooms.id, roomId))
      .limit(1);

    if (!room || room.status !== teamRoomStatuses.RECRUITING) {
      return jsonError("현재 모집 중인 팀이 아닙니다.", 409, "TEAM_NOT_RECRUITING");
    }

    if (room.leaderId === session.user.id) {
      return jsonError("방장은 자신의 팀에 지원할 수 없습니다.", 409, "LEADER_CANNOT_APPLY");
    }

    if (!(await hasActiveEventApplication(room.eventId, session.user.id))) {
      return jsonError(
        "행사 참가 신청 후 팀에 지원할 수 있습니다.",
        403,
        "EVENT_APPLICATION_REQUIRED",
      );
    }

    const ownedOrJoinedTeams = await db
      .select({
        leaderId: teamRecruitmentRooms.leaderId,
        membershipStatus: teamRoomApplications.status,
      })
      .from(teamRecruitmentRooms)
      .leftJoin(
        teamRoomApplications,
        and(
          eq(teamRoomApplications.roomId, teamRecruitmentRooms.id),
          eq(teamRoomApplications.memberId, session.user.id),
          eq(
            teamRoomApplications.status,
            teamApplicationStatuses.ACCEPTED,
          ),
        ),
      )
      .where(eq(teamRecruitmentRooms.eventId, room.eventId));

    if (
      ownedOrJoinedTeams.some(
        (team) =>
          team.leaderId === session.user.id ||
          team.membershipStatus === teamApplicationStatuses.ACCEPTED,
      )
    ) {
      return jsonError(
        "이미 이 행사의 팀에 소속되어 있습니다.",
        409,
        "MEMBER_ALREADY_ON_TEAM",
      );
    }

    const roomApplications = await db
      .select()
      .from(teamRoomApplications)
      .where(eq(teamRoomApplications.roomId, roomId));
    const acceptedCount = roomApplications.filter(
      (application) =>
        application.status === teamApplicationStatuses.ACCEPTED,
    ).length;

    if (acceptedCount + 1 >= room.capacity) {
      return jsonError("팀 정원이 마감되었습니다.", 409, "TEAM_FULL");
    }

    const existingApplication = roomApplications.find(
      (application) => application.memberId === session.user.id,
    );

    if (
      existingApplication &&
      existingApplication.status !== teamApplicationStatuses.REJECTED &&
      existingApplication.status !== teamApplicationStatuses.CANCELLED
    ) {
      return jsonError("이미 이 팀에 지원했습니다.", 409, "ALREADY_APPLIED");
    }

    const [application] = existingApplication
      ? await db
          .update(teamRoomApplications)
          .set({
            message: parsed.message,
            disclosureConsentVersion: teamProfileDisclosureConsentVersion,
            disclosureConsentGrantedAt: new Date(),
            disclosureConsentWithdrawnAt: null,
            status: teamApplicationStatuses.PENDING,
            updatedAt: new Date(),
          })
          .where(eq(teamRoomApplications.id, existingApplication.id))
          .returning()
      : await db
          .insert(teamRoomApplications)
          .values({
            roomId,
            memberId: session.user.id,
            message: parsed.message,
            disclosureConsentVersion: teamProfileDisclosureConsentVersion,
            disclosureConsentGrantedAt: new Date(),
          })
          .returning();

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return jsonError(error.message, error.status, error.code);
    }

    if (error instanceof ZodError) {
      return jsonError("지원 내용을 확인해주세요.", 400, "INVALID_BODY");
    }

    return jsonError("팀 지원을 처리하지 못했습니다.", 500, "TEAM_APPLY_FAILED");
  }
}

export async function DELETE(
  request: Request,
  { params }: TeamApplicationRouteProps,
): Promise<Response> {
  const session = await getMemberSessionFromRequest(request);

  if (!session) {
    return jsonError("로그인이 필요합니다.", 401, "UNAUTHORIZED");
  }

  const { roomId } = await params;
  const [application] = await db
    .select()
    .from(teamRoomApplications)
    .where(
      and(
        eq(teamRoomApplications.roomId, roomId),
        eq(teamRoomApplications.memberId, session.user.id),
      ),
    )
    .limit(1);

  if (!application) {
    return jsonError("지원 내역이 없습니다.", 404, "APPLICATION_NOT_FOUND");
  }

  const [cancelled] = await db
    .update(teamRoomApplications)
    .set({
      status: teamApplicationStatuses.CANCELLED,
      disclosureConsentWithdrawnAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(teamRoomApplications.id, application.id))
    .returning();

  if (
    application.status === teamApplicationStatuses.ACCEPTED
  ) {
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

  return NextResponse.json({ application: cancelled });
}
