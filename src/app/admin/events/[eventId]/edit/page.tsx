import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminEventEdit } from "@/features/admin/components/admin-event-edit";
import { db } from "@/server/db";
import { offlineEvents } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 모임 수정",
};

interface AdminEventEditPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function AdminEventEditPage({
  params,
}: AdminEventEditPageProps) {
  const { eventId } = await params;
  const [event] = await db
    .select()
    .from(offlineEvents)
    .where(eq(offlineEvents.id, eventId))
    .limit(1);

  if (!event) {
    notFound();
  }

  return (
    <AdminEventEdit
      event={{
        address: event.address ?? "",
        category: event.category,
        capacity: String(event.capacity),
        description: event.description,
        endsAt: event.endsAt ? toDateTimeLocal(event.endsAt) : "",
        id: event.id,
        locationName: event.locationName,
        participationFee: event.participationFee,
        region: event.region,
        startsAt: toDateTimeLocal(event.startsAt),
        status: event.status,
        targetRoles: event.targetRoles.join(", "),
        techTopics: event.techTopics.join(", "),
        title: event.title,
      }}
    />
  );
}

function toDateTimeLocal(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const date = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${date}T${hours}:${minutes}`;
}
