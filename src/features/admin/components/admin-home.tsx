"use client";

import { Card, Col, Row, Tag } from "antd";

import { AdminSummaryCards } from "@/features/admin/components/admin-summary-cards";
import type {
  AdminApplicationLogRow,
  AdminApplicationRow,
  AdminEventRow,
  AdminSummaryItem,
} from "@/features/admin/types";

interface AdminHomeProps {
  applicationLogs: AdminApplicationLogRow[];
  eventApplications: AdminApplicationRow[];
  offlineEvents: AdminEventRow[];
  summaryItems: AdminSummaryItem[];
}

export function AdminHome({
  applicationLogs,
  eventApplications,
  offlineEvents,
  summaryItems,
}: AdminHomeProps) {
  return (
    <div className="grid gap-6">
      <AdminSummaryCards items={summaryItems} />

      <Row gutter={[24, 24]}>
        <Col lg={12} xs={24}>
          <Card variant="outlined" className="shadow-sm" title="최근 오프라인 모임">
            {offlineEvents.length === 0 ? (
              <EmptyState>아직 등록된 모임이 없습니다.</EmptyState>
            ) : (
              <div className="divide-y divide-blue-50">
                {offlineEvents.map((event: AdminEventRow) => (
                  <AdminListRow
                    description={`${event.locationName} · 정원 ${
                      event.capacity
                    }명 · ${formatDateTime(event.startsAt)}`}
                    key={event.id}
                    title={event.title}
                  >
                    <Tag color={event.status === "published" ? "blue" : "default"}>
                      {event.status}
                    </Tag>
                  </AdminListRow>
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col lg={12} xs={24}>
          <Card variant="outlined" className="shadow-sm" title="최근 신청자">
            {eventApplications.length === 0 ? (
              <EmptyState>아직 신청자가 없습니다.</EmptyState>
            ) : (
              <div className="divide-y divide-blue-50">
                {eventApplications.map((application: AdminApplicationRow) => (
                  <AdminListRow
                    description={`${
                      application.memberEmail ?? application.memberId
                    } · ${formatDate(application.createdAt)}`}
                    key={application.id}
                    title={application.eventTitle ?? "행사 없음"}
                  >
                    <Tag color="blue">{application.attendanceStatus}</Tag>
                  </AdminListRow>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card variant="outlined" className="shadow-sm" title="최근 애플리케이션 로그">
        {applicationLogs.length === 0 ? (
          <EmptyState>아직 기록된 애플리케이션 로그가 없습니다.</EmptyState>
        ) : (
          <div className="divide-y divide-blue-50">
            {applicationLogs.map((log: AdminApplicationLogRow) => (
              <AdminListRow
                description={`${log.level} · ${log.route ?? "route 없음"} · ${formatDateTime(
                  log.occurredAt,
                )}`}
                key={log.id}
                title={log.message}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-ink/55">
      {children}
    </p>
  );
}

function AdminListRow({
  children,
  description,
  title,
}: {
  children?: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-5 text-ink/55">{description}</p>
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ko-KR");
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ko-KR");
}
