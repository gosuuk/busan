"use client";

import { Card, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";

import type { AdminUserRow } from "@/features/admin/types";

interface AdminMembersTableProps {
  users: AdminUserRow[];
}

export function AdminMembersTable({ users }: AdminMembersTableProps) {
  const columns: TableProps<AdminUserRow>["columns"] = [
    {
      dataIndex: "name",
      key: "name",
      title: "이름",
      render: (_value: unknown, user: AdminUserRow) => (
        <Space orientation="vertical" size={0}>
          <strong>{user.name}</strong>
          <span className="text-xs text-ink/50">
            {user.nickname ?? "닉네임 없음"}
          </span>
        </Space>
      ),
    },
    {
      dataIndex: "email",
      key: "email",
      title: "이메일",
    },
    {
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      title: "휴대폰",
    },
    {
      dataIndex: "role",
      key: "role",
      title: "권한",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>{role}</Tag>
      ),
    },
    {
      dataIndex: "status",
      key: "status",
      title: "상태",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "default"}>{status}</Tag>
      ),
    },
    {
      dataIndex: "createdAt",
      key: "createdAt",
      title: "가입일",
      render: (value: string) => new Date(value).toLocaleDateString("ko-KR"),
    },
  ];

  return (
    <Card
      variant="outlined"
      className="shadow-sm"
      extra={<Tag color="blue">no-store</Tag>}
      title="회원 관리"
    >
      <Table
        columns={columns}
        dataSource={users}
        pagination={{
          pageSize: 12,
          showSizeChanger: false,
        }}
        rowKey="id"
        scroll={{ x: 900 }}
        size="middle"
      />
    </Card>
  );
}
