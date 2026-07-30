import "server-only";

import { eq, inArray } from "drizzle-orm";

import { db } from "@/server/db";
import {
  eventApplications,
  eventApplicationStatuses,
  offlineEvents,
  offlineEventStatuses,
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
