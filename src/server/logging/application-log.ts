import "server-only";

import { db } from "@/server/db";
import { applicationLogs } from "@/server/db/schema";

export async function recordApplicationLog(input: {
  level: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
  method?: string;
  requestId?: string;
  route?: string;
  status?: string;
  userId?: string;
}): Promise<void> {
  try {
    await db.insert(applicationLogs).values({
      level: input.level,
      message: input.message,
      route: input.route,
      method: input.method,
      status: input.status,
      userId: input.userId,
      requestId: input.requestId,
      metadata: input.metadata ?? {},
      occurredAt: new Date(),
    });
  } catch {
    // DB logging must not block the request path.
  }
}
