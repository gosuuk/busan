import { desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminTeamRoomsTable } from "@/features/admin/components/admin-team-rooms-table";
import { db } from "@/server/db";
import {
  localUsers,
  offlineEvents,
  teamApplicationStatuses,
  teamRecruitmentRooms,
  teamRoomApplications,
} from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "관리자 팀 모집방" };

export default async function AdminTeamRoomsPage() {
  const rooms = await db
    .select({
      id: teamRecruitmentRooms.id,
      title: teamRecruitmentRooms.title,
      eventTitle: offlineEvents.title,
      eventSlug: offlineEvents.slug,
      leaderName: sql<string | null>`coalesce(${localUsers.nickname}, ${localUsers.name})`,
      capacity: teamRecruitmentRooms.capacity,
      memberCount: sql<number>`1 + count(${teamRoomApplications.id})::int`,
      status: teamRecruitmentRooms.status,
      createdAt: teamRecruitmentRooms.createdAt,
    })
    .from(teamRecruitmentRooms)
    .leftJoin(offlineEvents, eq(teamRecruitmentRooms.eventId, offlineEvents.id))
    .leftJoin(
      localUsers,
      sql`${teamRecruitmentRooms.leaderId} = ${localUsers.id}::text`,
    )
    .leftJoin(
      teamRoomApplications,
      sql`${teamRoomApplications.roomId} = ${teamRecruitmentRooms.id} and ${teamRoomApplications.status} = ${teamApplicationStatuses.ACCEPTED}`,
    )
    .groupBy(teamRecruitmentRooms.id, offlineEvents.id, localUsers.id)
    .orderBy(desc(teamRecruitmentRooms.createdAt))
    .limit(100);

  return (
    <AdminTeamRoomsTable
      rooms={rooms.map((room) => ({
        ...room,
        createdAt: room.createdAt.toISOString(),
      }))}
    />
  );
}
