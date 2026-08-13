import "server-only";

import { asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/server/db";
import {
  eventApplications,
  eventApplicationStatuses,
  offlineEvents,
  offlineEventStatuses,
  localUsers,
  memberProfiles,
  teamApplicationStatuses,
  teamRecruitmentRooms,
  teamRoomApplications,
} from "@/server/db/schema";

const occupiedStatuses = new Set<string>([
  eventApplicationStatuses.REGISTERED,
  eventApplicationStatuses.CONFIRMED,
  eventApplicationStatuses.ATTENDED,
]);

const publicEventStatuses = [
  offlineEventStatuses.PUBLISHED,
  offlineEventStatuses.CLOSED,
  offlineEventStatuses.CANCELED,
];

export async function getPublishedEventsWithSeats() {
  const [events, applications] = await Promise.all([
    db
      .select()
      .from(offlineEvents)
      .where(inArray(offlineEvents.status, publicEventStatuses)),
    db
      .select({
        eventId: eventApplications.eventId,
        attendanceStatus: eventApplications.attendanceStatus,
      })
      .from(eventApplications),
  ]);

  return events
    .map((event) => {
      const occupiedCount = applications.filter(
        (application) =>
          application.eventId === event.id &&
          occupiedStatuses.has(application.attendanceStatus),
      ).length;

      return {
        ...event,
        occupiedCount,
        remainingSeats: Math.max(event.capacity - occupiedCount, 0),
      };
    })
    .sort((a, b) => {
      const aEnded = isEventEnded(a);
      const bEnded = isEventEnded(b);

      if (aEnded !== bEnded) {
        return aEnded ? 1 : -1;
      }

      if (aEnded && bEnded) {
        return b.startsAt.getTime() - a.startsAt.getTime();
      }

      return a.startsAt.getTime() - b.startsAt.getTime();
    });
}

export async function getPublishedEventBySlug(slug: string) {
  const slugCandidates = Array.from(
    new Set([slug, decodeRouteSegment(slug)]),
  );
  const [event] = await db
    .select()
    .from(offlineEvents)
    .where(inArray(offlineEvents.slug, slugCandidates))
    .limit(1);

  if (
    !event ||
    (event.status !== offlineEventStatuses.PUBLISHED &&
      event.status !== offlineEventStatuses.CLOSED)
  ) {
    return null;
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

  return {
    ...event,
    occupiedCount,
    remainingSeats: Math.max(event.capacity - occupiedCount, 0),
  };
}

export async function getEventApplicationForMember(
  eventId: string,
  memberId: string,
) {
  const applications = await db
    .select()
    .from(eventApplications)
    .where(eq(eventApplications.eventId, eventId));

  return (
    applications.find(
      (application) =>
        application.memberId === memberId &&
        application.attendanceStatus !== eventApplicationStatuses.CANCELLED,
    ) ?? null
  );
}

export async function hasActiveEventApplication(
  eventId: string,
  memberId: string,
): Promise<boolean> {
  const application = await getEventApplicationForMember(eventId, memberId);

  return Boolean(
    application &&
      application.attendanceStatus !== eventApplicationStatuses.NO_SHOW,
  );
}

export async function getTeamRoomsForEvent(
  eventId: string,
  viewerId?: string,
) {
  const [rooms, applications] = await Promise.all([
    db
      .select({
        id: teamRecruitmentRooms.id,
        eventId: teamRecruitmentRooms.eventId,
        leaderId: teamRecruitmentRooms.leaderId,
        leaderName: localUsers.nickname,
        leaderFallbackName: localUsers.name,
        title: teamRecruitmentRooms.title,
        description: teamRecruitmentRooms.description,
        neededRoles: teamRecruitmentRooms.neededRoles,
        capacity: teamRecruitmentRooms.capacity,
        contact: teamRecruitmentRooms.contact,
        status: teamRecruitmentRooms.status,
        createdAt: teamRecruitmentRooms.createdAt,
      })
      .from(teamRecruitmentRooms)
      .leftJoin(
        localUsers,
        sql`${teamRecruitmentRooms.leaderId} = ${localUsers.id}::text`,
      )
      .where(eq(teamRecruitmentRooms.eventId, eventId))
      .orderBy(asc(teamRecruitmentRooms.createdAt)),
    db
      .select({
        id: teamRoomApplications.id,
        roomId: teamRoomApplications.roomId,
        memberId: teamRoomApplications.memberId,
        memberName: localUsers.nickname,
        memberFallbackName: localUsers.name,
        memberEmail: localUsers.email,
        profileId: memberProfiles.id,
        profileNickname: memberProfiles.nickname,
        profileIntroduction: memberProfiles.introduction,
        profileJobCategory: memberProfiles.jobCategory,
        profileExperienceRange: memberProfiles.experienceRange,
        profileGithubUrl: memberProfiles.githubUrl,
        profilePortfolioUrl: memberProfiles.portfolioUrl,
        profilePublicEmail: memberProfiles.publicEmail,
        profileMetadata: memberProfiles.metadata,
        message: teamRoomApplications.message,
        status: teamRoomApplications.status,
        disclosureConsentVersion:
          teamRoomApplications.disclosureConsentVersion,
        disclosureConsentGrantedAt:
          teamRoomApplications.disclosureConsentGrantedAt,
        disclosureConsentWithdrawnAt:
          teamRoomApplications.disclosureConsentWithdrawnAt,
        createdAt: teamRoomApplications.createdAt,
      })
      .from(teamRoomApplications)
      .innerJoin(
        teamRecruitmentRooms,
        eq(teamRoomApplications.roomId, teamRecruitmentRooms.id),
      )
      .leftJoin(
        localUsers,
        sql`${teamRoomApplications.memberId} = ${localUsers.id}::text`,
      )
      .leftJoin(
        memberProfiles,
        eq(teamRoomApplications.memberId, memberProfiles.userId),
      )
      .where(eq(teamRecruitmentRooms.eventId, eventId))
      .orderBy(asc(teamRoomApplications.createdAt)),
  ]);

  return rooms.map((room) => {
    const roomApplications = applications.filter(
      (application) => application.roomId === room.id,
    );
    const acceptedMembers = roomApplications.filter(
      (application) =>
        application.status === teamApplicationStatuses.ACCEPTED,
    );
    const viewerApplication = viewerId
      ? roomApplications.find(
          (application) => application.memberId === viewerId,
        ) ?? null
      : null;
    const canSeeContact = Boolean(
      viewerId &&
        (room.leaderId === viewerId ||
          viewerApplication?.status === teamApplicationStatuses.ACCEPTED),
    );
    const canSeeTeamRoster = canSeeContact;

    return {
      ...room,
      contact: canSeeContact ? room.contact : null,
      leaderName: room.leaderName ?? room.leaderFallbackName ?? "회원",
      acceptedCount: acceptedMembers.length,
      memberCount: acceptedMembers.length + 1,
      acceptedMembers: acceptedMembers.map((application, index) => ({
        id: application.memberId,
        name: canSeeTeamRoster
          ? application.memberName ??
            application.memberFallbackName ??
            "회원"
          : `팀원 ${index + 1}`,
      })),
      viewerApplication: viewerApplication
        ? {
            id: viewerApplication.id,
            status: viewerApplication.status,
          }
        : null,
      applications:
        viewerId === room.leaderId
          ? roomApplications.map((application) => {
              const hasActiveDisclosureConsent = Boolean(
                application.disclosureConsentGrantedAt &&
                  !application.disclosureConsentWithdrawnAt &&
                  (application.status === teamApplicationStatuses.PENDING ||
                    application.status === teamApplicationStatuses.ACCEPTED),
              );

              return {
                id: application.id,
                memberId: application.memberId,
                memberName: hasActiveDisclosureConsent
                  ? application.memberName ??
                    application.memberFallbackName ??
                    "회원"
                  : "정보 공개 동의 전 지원자",
                message: application.message,
                status: application.status,
                disclosureConsentGrantedAt: hasActiveDisclosureConsent
                  ? application.disclosureConsentGrantedAt?.toISOString() ?? null
                  : null,
                disclosureConsentVersion: hasActiveDisclosureConsent
                  ? application.disclosureConsentVersion
                  : null,
                profile: hasActiveDisclosureConsent
                  ? {
                      profileId: application.profileId,
                      nickname:
                        application.profileNickname ?? application.memberName,
                      name: application.memberFallbackName,
                      email: application.memberEmail,
                      introduction: application.profileIntroduction,
                      jobCategory: application.profileJobCategory,
                      experienceRange: application.profileExperienceRange,
                      githubUrl: application.profileGithubUrl,
                      portfolioUrl: application.profilePortfolioUrl,
                      publicEmail: application.profilePublicEmail,
                      interestedTopics:
                        application.profileMetadata?.interestedTopics ?? [],
                      activityAreas:
                        application.profileMetadata?.activityAreas ?? [],
                      networkingGoals:
                        application.profileMetadata?.networkingGoals ?? [],
                    }
                  : null,
              };
            })
          : [],
    };
  });
}

export function getRecruitingStatus(input: {
  endsAt?: Date | null;
  remainingSeats: number;
  startsAt: Date;
  status: string;
}): string {
  if (input.status === offlineEventStatuses.CLOSED) return "종료된 모임";
  if (input.status === offlineEventStatuses.CANCELED) return "취소된 모임";
  if (input.status !== offlineEventStatuses.PUBLISHED) return "비공개";
  if (isEventEnded(input)) return "종료된 모임";
  if (input.remainingSeats <= 0) return "대기 신청";
  return "모집 중";
}

export function isEventEnded(
  input:
    | Date
    | {
        endsAt?: Date | null;
        startsAt: Date;
        status?: string;
      },
): boolean {
  if (
    !(input instanceof Date) &&
    (input.status === offlineEventStatuses.CLOSED ||
      input.status === offlineEventStatuses.CANCELED)
  ) {
    return true;
  }

  const comparableDate = input instanceof Date ? input : input.endsAt ?? input.startsAt;
  return comparableDate.getTime() < Date.now();
}

function decodeRouteSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
