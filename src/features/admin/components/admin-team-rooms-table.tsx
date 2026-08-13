"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Select, Table, Tag } from "antd";
import type { TableProps } from "antd";

import type { AdminTeamRoomRow } from "@/features/admin/types";
import { apiRequest } from "@/lib/api-client";

interface AdminTeamRoomsTableProps {
  rooms: AdminTeamRoomRow[];
}

export function AdminTeamRoomsTable({ rooms }: AdminTeamRoomsTableProps) {
  const router = useRouter();
  const columns: TableProps<AdminTeamRoomRow>["columns"] = [
    {
      dataIndex: "title",
      key: "title",
      title: "팀",
      render: (value: string, room) => (
        <div>
          <strong>{value}</strong>
          <p className="mt-1 text-xs text-ink/50">
            방장 {room.leaderName ?? "알 수 없음"}
          </p>
        </div>
      ),
    },
    {
      dataIndex: "eventTitle",
      key: "eventTitle",
      title: "행사",
      render: (value: string | null, room) =>
        room.eventSlug ? (
          <Link className="text-blue-600" href={`/events/${room.eventSlug}`}>
            {value ?? "행사 보기"}
          </Link>
        ) : (
          value ?? "삭제된 행사"
        ),
    },
    {
      key: "members",
      title: "팀원",
      render: (_value, room) => `${room.memberCount}/${room.capacity}명`,
    },
    {
      dataIndex: "createdAt",
      key: "createdAt",
      title: "생성일",
      render: (value: string) => new Date(value).toLocaleString("ko-KR"),
    },
    {
      dataIndex: "status",
      key: "status",
      title: "상태 관리",
      render: (value: string, room) => (
        <Select
          onChange={(status) => updateStatus(room.id, status)}
          options={[
            { label: "모집 중", value: "recruiting" },
            { label: "모집 완료", value: "full" },
            { label: "모집 종료", value: "closed" },
          ]}
          size="small"
          suffixIcon={<Tag color={value === "recruiting" ? "blue" : "default"} />}
          value={value}
        />
      ),
    },
  ];

  async function updateStatus(roomId: string, status: string) {
    await apiRequest(`/api/admin/team-rooms/${roomId}`, {
      method: "PATCH",
      json: { status },
    });
    router.refresh();
  }

  return (
    <Card variant="outlined" className="shadow-sm" title="팀 모집방 관리">
      <Table
        columns={columns}
        dataSource={rooms}
        pagination={{ pageSize: 15, showSizeChanger: false }}
        rowKey="id"
        scroll={{ x: 900 }}
      />
    </Card>
  );
}
