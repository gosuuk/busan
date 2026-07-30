"use client";

import Link from "next/link";
import { Button, Card, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";

import type { AdminEventRow } from "@/features/admin/types";

interface AdminEventsTableProps {
  events: AdminEventRow[];
}

export function AdminEventsTable({ events }: AdminEventsTableProps) {
  const columns: TableProps<AdminEventRow>["columns"] = [
    {
      dataIndex: "title",
      key: "title",
      title: "모임명",
      render: (value: string, event: AdminEventRow) => (
        <Space orientation="vertical" size={0}>
          <strong>{value}</strong>
          <span className="text-xs text-ink/50">{event.locationName}</span>
        </Space>
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
        <Tag color={value === "published" ? "blue" : "default"}>{value}</Tag>
      ),
    },
    {
      key: "actions",
      title: "관리",
      render: (_value: unknown, event: AdminEventRow) => (
        <Button
          onClick={() => handleEditClick(event)}
          size="small"
          type="link"
        >
          수정
        </Button>
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
