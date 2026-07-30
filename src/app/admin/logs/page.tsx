import { desc } from "drizzle-orm";
import type { Metadata } from "next";

import { AdminLogs } from "@/features/admin/components/admin-logs";
import { db } from "@/server/db";
import { applicationLogs, auditLogs, securityEvents } from "@/server/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "관리자 로그",
};

export default async function AdminLogsPage() {
  const [recentAuditLogs, recentSecurityEvents, recentApplicationLogs] =
    await Promise.all([
      db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          targetType: auditLogs.targetType,
          actorRole: auditLogs.actorRole,
          occurredAt: auditLogs.occurredAt,
        })
        .from(auditLogs)
        .orderBy(desc(auditLogs.occurredAt))
        .limit(50),
      db
        .select({
          id: securityEvents.id,
          eventType: securityEvents.eventType,
          severity: securityEvents.severity,
          route: securityEvents.route,
          occurredAt: securityEvents.occurredAt,
        })
        .from(securityEvents)
        .orderBy(desc(securityEvents.occurredAt))
        .limit(50),
      db
        .select({
          id: applicationLogs.id,
          level: applicationLogs.level,
          message: applicationLogs.message,
          route: applicationLogs.route,
          occurredAt: applicationLogs.occurredAt,
        })
        .from(applicationLogs)
        .orderBy(desc(applicationLogs.occurredAt))
        .limit(50),
    ]);

  return (
    <AdminLogs
      applicationLogs={recentApplicationLogs.map((log) => ({
        ...log,
        occurredAt: log.occurredAt.toISOString(),
      }))}
      auditLogs={recentAuditLogs.map((log) => ({
        ...log,
        occurredAt: log.occurredAt.toISOString(),
      }))}
      securityEvents={recentSecurityEvents.map((event) => ({
        ...event,
        occurredAt: event.occurredAt.toISOString(),
      }))}
    />
  );
}
