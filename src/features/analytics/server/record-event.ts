import "server-only";

import { db } from "@/server/db";
import { analyticsEvents } from "@/server/db/schema";

export async function recordProductEvent(input: {
  entityId?: string;
  entityType?: "event" | "post" | "profile";
  eventName: string;
  pagePath?: string;
  properties?: Record<string, string | number | boolean | null>;
  source?: "server" | "web" | "admin";
  userId?: string;
}): Promise<void> {
  try {
    await db.insert(analyticsEvents).values({
      userId: input.userId,
      eventName: input.eventName,
      eventVersion: "1",
      pagePath: input.pagePath,
      entityType: input.entityType,
      entityId: input.entityId,
      properties: input.properties ?? {},
      source: input.source ?? "server",
      occurredAt: new Date(),
    });
  } catch {
    // Product analytics should not block user-facing flows.
  }
}
