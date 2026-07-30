"use client";

import { Card, Col, Row, Tag } from "antd";

import type {
  AdminApplicationLogRow,
  AdminAuditLogRow,
  AdminSecurityLogRow,
} from "@/features/admin/types";

interface AdminLogsProps {
  applicationLogs: AdminApplicationLogRow[];
  auditLogs: AdminAuditLogRow[];
  securityEvents: AdminSecurityLogRow[];
}

export function AdminLogs({
  applicationLogs,
  auditLogs,
  securityEvents,
}: AdminLogsProps) {
  return (
    <Row gutter={[24, 24]}>
      <Col lg={12} xs={24}>
        <Card variant="outlined" className="shadow-sm" title="보안 이벤트">
          {securityEvents.length === 0 ? (
            <EmptyState>아직 기록된 보안 이벤트가 없습니다.</EmptyState>
          ) : (
            <div className="divide-y divide-blue-50">
              {securityEvents.map((event: AdminSecurityLogRow) => (
                <AdminLogRow
                  description={`${event.route ?? "route 없음"} · ${formatDateTime(
                    event.occurredAt,
                  )}`}
                  key={event.id}
                  title={event.eventType}
                >
                  <Tag color={event.severity === "high" ? "red" : "blue"}>
                    {event.severity}
                  </Tag>
                </AdminLogRow>
              ))}
            </div>
          )}
        </Card>
      </Col>

      <Col lg={12} xs={24}>
        <Card variant="outlined" className="shadow-sm" title="애플리케이션 로그">
          {applicationLogs.length === 0 ? (
            <EmptyState>아직 기록된 애플리케이션 로그가 없습니다.</EmptyState>
          ) : (
            <div className="divide-y divide-blue-50">
              {applicationLogs.map((log: AdminApplicationLogRow) => (
                <AdminLogRow
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
      </Col>

      <Col xs={24}>
        <Card variant="outlined" className="shadow-sm" title="최근 감사로그">
          {auditLogs.length === 0 ? (
            <EmptyState>아직 기록된 감사로그가 없습니다.</EmptyState>
          ) : (
            <div className="divide-y divide-blue-50">
              {auditLogs.map((log: AdminAuditLogRow) => (
                <AdminLogRow
                  description={`${log.targetType ?? "target 없음"} · ${
                    log.actorRole ?? "role 없음"
                  } · ${formatDateTime(log.occurredAt)}`}
                  key={log.id}
                  title={log.action}
                />
              ))}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-ink/55">
      {children}
    </p>
  );
}

function AdminLogRow({
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
        <p className="break-words text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-5 text-ink/55">{description}</p>
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ko-KR");
}
