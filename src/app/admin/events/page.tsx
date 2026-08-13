import { desc, sql } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminEventsTable } from "@/features/admin/components/admin-events-table";
import { db } from "@/server/db";
import { localUsers, offlineEvents } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 모임",
};

export default async function AdminEventsPage() {
  const events = await db
    .select({
      id: offlineEvents.id,
      title: offlineEvents.title,
      category: offlineEvents.category,
      creatorName: sql<string | null>`coalesce(${localUsers.nickname}, ${localUsers.name})`,
      locationName: offlineEvents.locationName,
      startsAt: offlineEvents.startsAt,
      capacity: offlineEvents.capacity,
      status: offlineEvents.status,
    })
    .from(offlineEvents)
    .leftJoin(
      localUsers,
      sql`${offlineEvents.createdByUserId} = ${localUsers.id}::text`,
    )
    .orderBy(desc(offlineEvents.startsAt))
    .limit(100);

  return (
    <AdminEventsTable
      events={events.map((event) => ({
        ...event,
        startsAt: event.startsAt.toISOString(),
      }))}
    />
  );
}
