"use client";

import Link from "next/link";
import { Button, Card } from "antd";

import { OfflineEventForm } from "@/features/admin/components/offline-event-form";

interface AdminEventEditProps {
  event: {
    address: string;
    capacity: string;
    description: string;
    endsAt: string;
    id: string;
    locationName: string;
    participationFee: string;
    region: string;
    startsAt: string;
    status: string;
    targetRoles: string;
    techTopics: string;
    title: string;
  };
}

export function AdminEventEdit({ event }: AdminEventEditProps) {
  return (
    <Card
      variant="outlined"
      className="shadow-sm"
      extra={
        <Link href="/admin/events">
          <Button>목록으로</Button>
        </Link>
      }
      title="오프라인 모임 수정"
    >
      <div className="max-w-3xl">
        <OfflineEventForm
          actionPath={`/api/admin/events/${event.id}`}
          initialValues={{
            address: event.address,
            capacity: event.capacity,
            description: event.description,
            endsAt: event.endsAt,
            locationName: event.locationName,
            participationFee: event.participationFee,
            region: event.region,
            startsAt: event.startsAt,
            status: event.status,
            targetRoles: event.targetRoles,
            techTopics: event.techTopics,
            title: event.title,
          }}
          mode="edit"
        />
      </div>
    </Card>
  );
}
