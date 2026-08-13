import { count, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminHome } from "@/features/admin/components/admin-home";
import { db } from "@/server/db";
import {
  applicationLogs,
  eventApplications,
  localUserRoles,
  localUsers,
  localUserStatuses,
  offlineEvents,
} from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 대시보드",
};

export default async function AdminPage() {
  const [
    totalRows,
    activeRows,
    adminRows,
    suspendedRows,
    recentApplicationLogs,
    recentOfflineEvents,
    recentEventApplications,
  ] = await Promise.all([
    db.select({ value: count() }).from(localUsers),
    db
      .select({ value: count() })
      .from(localUsers)
      .where(eq(localUsers.status, localUserStatuses.ACTIVE)),
    db
      .select({ value: count() })
      .from(localUsers)
      .where(eq(localUsers.role, localUserRoles.ADMIN)),
    db
      .select({ value: count() })
      .from(localUsers)
      .where(eq(localUsers.status, localUserStatuses.SUSPENDED)),
    db
      .select({
        id: applicationLogs.id,
        level: applicationLogs.level,
        message: applicationLogs.message,
        route: applicationLogs.route,
        occurredAt: applicationLogs.occurredAt,
      })
      .from(applicationLogs)
      .orderBy(desc(applicationLogs.occurredAt))
      .limit(6),
    db
      .select({
        id: offlineEvents.id,
        title: offlineEvents.title,
        category: offlineEvents.category,
        creatorName: sql<string | null>`null`,
        locationName: offlineEvents.locationName,
        startsAt: offlineEvents.startsAt,
        capacity: offlineEvents.capacity,
        status: offlineEvents.status,
      })
      .from(offlineEvents)
      .orderBy(desc(offlineEvents.startsAt))
      .limit(6),
    db
      .select({
        id: eventApplications.id,
        eventId: eventApplications.eventId,
        memberId: eventApplications.memberId,
        eventTitle: offlineEvents.title,
        memberEmail: localUsers.email,
        memberNickname: localUsers.nickname,
        attendanceStatus: eventApplications.attendanceStatus,
        participationReason: eventApplications.participationReason,
        createdAt: eventApplications.createdAt,
      })
      .from(eventApplications)
      .leftJoin(offlineEvents, eq(eventApplications.eventId, offlineEvents.id))
      .leftJoin(
        localUsers,
        sql`${eventApplications.memberId} = ${localUsers.id}::text`,
      )
      .orderBy(desc(eventApplications.createdAt))
      .limit(6),
  ]);

  return (
    <AdminHome
      applicationLogs={recentApplicationLogs.map((log) => ({
        ...log,
        occurredAt: log.occurredAt.toISOString(),
      }))}
      eventApplications={recentEventApplications.map((application) => ({
        ...application,
        createdAt: application.createdAt.toISOString(),
      }))}
      offlineEvents={recentOfflineEvents.map((event) => ({
        ...event,
        startsAt: event.startsAt.toISOString(),
      }))}
      summaryItems={[
        {
          label: "전체 회원",
          value: totalRows[0]?.value ?? 0,
          description: "로컬 가입 계정",
        },
        {
          label: "활성 회원",
          value: activeRows[0]?.value ?? 0,
          description: "로그인 가능 상태",
        },
        {
          label: "관리자",
          value: adminRows[0]?.value ?? 0,
          description: "admin role 보유",
        },
        {
          label: "제재 계정",
          value: suspendedRows[0]?.value ?? 0,
          description: "접근 제한 상태",
        },
      ]}
    />
  );
}
