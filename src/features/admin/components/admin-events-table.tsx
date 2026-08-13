"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";

import type { AdminEventRow } from "@/features/admin/types";
import { eventCategoryLabels } from "@/features/events/server/schema";
import { apiRequest } from "@/lib/api-client";

interface AdminEventsTableProps {
  events: AdminEventRow[];
}

export function AdminEventsTable({ events }: AdminEventsTableProps) {
  const router = useRouter();
  const columns: TableProps<AdminEventRow>["columns"] = [
    {
      dataIndex: "title",
      key: "title",
      title: "모임명",
      render: (value: string, event: AdminEventRow) => (
        <Space orientation="vertical" size={0}>
          <strong>{value}</strong>
          <span className="text-xs text-ink/50">{event.locationName}</span>
          <span className="text-xs text-ink/50">
            작성자: {event.creatorName ?? "알 수 없음"}
          </span>
        </Space>
      ),
    },
    {
      dataIndex: "category",
      key: "category",
      title: "카테고리",
      render: (value: keyof typeof eventCategoryLabels) => (
        <Tag>{eventCategoryLabels[value] ?? value}</Tag>
      ),
    },
    {
      dataIndex: "startsAt",
      key: "startsAt",
      title: "일시",
      render: (value: string) => new Date(value).toLocaleString("ko-KR"),
    },
    {
      dataIndex: "capacity",
      key: "capacity",
      title: "정원",
      render: (value: number) => `${value}명`,
    },
    {
      dataIndex: "status",
      key: "status",
      title: "상태",
      render: (value: string) => (
        <Tag color={getStatusColor(value)}>{statusLabels[value] ?? value}</Tag>
      ),
    },
    {
      key: "actions",
      title: "관리",
      render: (_value: unknown, event: AdminEventRow) => (
        <Space wrap>
          {event.status === "pending" ? (
            <>
              <Button
                onClick={() => handleStatusChange(event.id, "published")}
                size="small"
                type="primary"
              >
                승인
              </Button>
              <Button
                danger
                onClick={() => handleStatusChange(event.id, "rejected")}
                size="small"
              >
                반려
              </Button>
            </>
          ) : null}
          <Button
            onClick={() => handleEditClick(event)}
            size="small"
            type="link"
          >
            수정
          </Button>
        </Space>
      ),
    },
  ];

  async function handleEditClick(event: AdminEventRow) {
    try {
      await fetch("/api/admin/audit-actions", {
        body: JSON.stringify({
          action: "admin_event_edit_clicked",
          metadata: {
            title: event.title,
          },
          targetId: event.id,
          targetType: "offline_event",
        }),
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    } finally {
      window.location.assign(`/admin/events/${event.id}/edit`);
    }
  }

  async function handleStatusChange(eventId: string, status: string) {
    await apiRequest(`/api/admin/events/${eventId}/status`, {
      method: "PATCH",
      json: { status },
    });
    router.refresh();
  }

  return (
    <Card
      variant="outlined"
      className="shadow-sm"
      extra={
        <Link href="/admin/events/new">
          <Button type="primary">모임 생성</Button>
        </Link>
      }
      title="오프라인 모임"
    >
      <Table
        columns={columns}
        dataSource={events}
        pagination={{
          pageSize: 12,
          showSizeChanger: false,
        }}
        rowKey="id"
        scroll={{ x: 840 }}
        size="middle"
      />
    </Card>
  );
}

const statusLabels: Record<string, string> = {
  draft: "임시저장",
  pending: "검토 대기",
  published: "공개",
  closed: "종료",
  canceled: "취소",
  rejected: "반려",
};

function getStatusColor(status: string): string {
  if (status === "published") return "blue";
  if (status === "pending") return "gold";
  if (status === "rejected" || status === "canceled") return "red";
  return "default";
}
