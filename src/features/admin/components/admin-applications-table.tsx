"use client";

import { Card, Space, Table } from "antd";
import type { TableProps } from "antd";

import { ApplicationStatusSelect } from "@/features/admin/components/application-status-select";
import type { AdminApplicationRow } from "@/features/admin/types";

interface AdminApplicationsTableProps {
  applications: AdminApplicationRow[];
}

export function AdminApplicationsTable({
  applications,
}: AdminApplicationsTableProps) {
  const columns: TableProps<AdminApplicationRow>["columns"] = [
    {
      dataIndex: "eventTitle",
      key: "eventTitle",
      title: "행사",
      render: (_value: unknown, application: AdminApplicationRow) => (
        <Space orientation="vertical" size={0}>
          <strong>{application.eventTitle ?? "행사 없음"}</strong>
          <span className="text-xs text-ink/50">
            {application.eventId.slice(0, 8)}
          </span>
        </Space>
      ),
    },
    {
      dataIndex: "memberEmail",
      key: "memberEmail",
      title: "회원",
      render: (_value: unknown, application: AdminApplicationRow) => (
        <Space orientation="vertical" size={0}>
          <strong>{application.memberNickname ?? "닉네임 없음"}</strong>
          <span className="text-xs text-ink/50">
            {application.memberEmail ?? application.memberId}
          </span>
        </Space>
      ),
    },
    {
      dataIndex: "participationReason",
      key: "participationReason",
      title: "참가 목적",
      render: (value: string | null) => value ?? "입력 없음",
    },
    {
      dataIndex: "attendanceStatus",
      key: "attendanceStatus",
      title: "상태",
      render: (value: string, application: AdminApplicationRow) => (
        <ApplicationStatusSelect
          applicationId={application.id}
          value={value}
        />
      ),
    },
    {
      dataIndex: "createdAt",
      key: "createdAt",
      title: "신청일",
      render: (value: string) => new Date(value).toLocaleDateString("ko-KR"),
    },
  ];

  return (
    <Card variant="outlined" className="shadow-sm" title="신청자·참석자 관리">
      <p className="mb-4 text-sm text-ink/55">
        QR 없이 관리자 화면에서 참석 상태를 직접 변경합니다.
      </p>
      <Table
        columns={columns}
        dataSource={applications}
        pagination={{
          pageSize: 12,
          showSizeChanger: false,
        }}
        rowKey="id"
        scroll={{ x: 920 }}
        size="middle"
      />
    </Card>
  );
}
