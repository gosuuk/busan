import { desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminApplicationsTable } from "@/features/admin/components/admin-applications-table";
import { db } from "@/server/db";
import { eventApplications, localUsers, offlineEvents } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 신청자",
};

export default async function AdminApplicationsPage() {
  const applications = await db
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
    .limit(100);

  return (
    <AdminApplicationsTable
      applications={applications.map((application) => ({
        ...application,
        createdAt: application.createdAt.toISOString(),
      }))}
    />
  );
}
