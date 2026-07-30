"use client";

import Link from "next/link";
import { Button, Card } from "antd";

import { OfflineEventForm } from "@/features/admin/components/offline-event-form";

export function AdminEventCreate() {
  return (
    <Card
      variant="outlined"
      className="shadow-sm"
      extra={
        <Link href="/admin/events">
          <Button>목록으로</Button>
        </Link>
      }
      title="오프라인 모임 생성"
    >
      <div className="max-w-3xl">
        <OfflineEventForm />
      </div>
    </Card>
  );
}
